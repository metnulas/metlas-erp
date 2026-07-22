# metlas.ps1 - METLAS ERP PowerShell Yardimci Modulu
# Kullanim: powershell -ExecutionPolicy Bypass -File metlas.ps1 <komut>
# Komutlar: status, start-background, stop, log

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile    = Join-Path $scriptPath "metlas.pid"
$logFile    = Join-Path $scriptPath "metlas.log"

function Get-LocalIP {
    $ip = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "*" | Where-Object {
        $_.IPAddress -notmatch "^(127\.|169\.)" -and $_.AddressState -eq "Preferred"
    } | Select-Object -First 1 -ExpandProperty IPAddress
    if (-not $ip) { $ip = "127.0.0.1" }
    return $ip
}

function Test-MetlasProcess($procId) {
    $currentId = $procId
    for ($i = 0; $i -lt 8 -and $currentId; $i++) {
        try {
            $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$currentId" -ErrorAction Stop
        } catch {
            return $false
        }
        if (-not $proc) { return $false }

        $cmd = "$($proc.CommandLine)"
        if ($cmd -like "*$scriptPath*" -or $cmd -match "next(\.cmd)?(\.js)?\s+dev|npm(\.cmd)?\s+run\s+dev") {
            return $true
        }
        $currentId = $proc.ParentProcessId
    }
    return $false
}

function Get-PortOwner {
    $conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) { return $conn.OwningProcess }
    return $null
}

function Get-ServerProcess {
    $procId = $null
    if (Test-Path $pidFile) {
        $procId = Get-Content $pidFile -Raw -ErrorAction SilentlyContinue
        $procId = "$procId".Trim()
    }
    if ($procId -and ($proc = Get-Process -Id $procId -ErrorAction SilentlyContinue) -and (Test-MetlasProcess $procId)) {
        return @{ Process = $proc; Pid = $procId }
    }
    elseif ($procId) {
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    }

    $portPid = Get-PortOwner
    if ($portPid -and (Test-MetlasProcess $portPid)) {
        $proc = Get-Process -Id $portPid -ErrorAction SilentlyContinue
        if ($proc) {
            $portPid | Out-File -FilePath $pidFile -Encoding ASCII
            return @{ Process = $proc; Pid = $portPid }
        }
    }
    return $null
}

if ($args[0] -eq "status" -or $args[0] -eq "status-line") {
    $server = Get-ServerProcess
    $portPid = Get-PortOwner
    $ip = Get-LocalIP
    $uptime = "-"
    $status = "STOPPED"
    $serverPid = "-"

    if ($server) {
        $p = $server.Process
        $startTime = $p.StartTime
        $elapsed = [DateTime]::Now - $startTime
        $uptime = "{0:D2}:{1:D2}:{2:D2}" -f $elapsed.Hours, $elapsed.Minutes, $elapsed.Seconds
        $status = "RUNNING"
        $serverPid = $server.Pid
    }

    if ($portPid -and -not $server) {
        $portMessage = "PORT_BUSY:$portPid"
    }
    else {
        $portMessage = "PORT_OK"
    }

    if ($args[0] -eq "status-line") {
        Write-Output "$status|$serverPid|$uptime|$ip|$portMessage"
    }
    else {
        Write-Output $status
        Write-Output $serverPid
        Write-Output $uptime
        Write-Output $ip
        Write-Output $portMessage
    }
    exit 0
}

if ($args[0] -eq "start-background") {
    $existing = Get-ServerProcess
    if ($existing) {
        Write-Output "ALREADY_RUNNING:$($existing.Pid)"
        exit 1
    }

    $portPid = Get-PortOwner
    if ($portPid) {
        Write-Output "PORT_IN_USE:$portPid"
        exit 2
    }

    $command = "npm.cmd run dev >> `"$logFile`" 2>&1"
    try {
        $child = Start-Process -FilePath "cmd.exe" `
            -ArgumentList @('/d', '/c', $command) `
            -WorkingDirectory $scriptPath `
            -WindowStyle Hidden `
            -PassThru -ErrorAction Stop
    }
    catch {
        Write-Output "ERROR:CREATE_FAILED_$($_.Exception.Message)"
        exit 3
    }

    $deadline = (Get-Date).AddSeconds(20)
    do {
        Start-Sleep -Milliseconds 500
        $portPid = Get-PortOwner
        if ($portPid -and (Test-MetlasProcess $portPid)) {
            $portPid | Out-File -FilePath $pidFile -Encoding ASCII
            Write-Output "STARTED:$portPid"
            exit 0
        }
    } while ((Get-Date) -lt $deadline)

    $server = Get-ServerProcess
    if ($server) {
        Write-Output "STARTED:$($server.Pid)"
    }
    else {
        Write-Output "ERROR:SERVER_NOT_READY"
        exit 3
    }
    exit 0
}

if ($args[0] -eq "stop") {
    $server = Get-ServerProcess
    if (-not $server) {
        if (Test-Path $pidFile) { Remove-Item $pidFile -Force -ErrorAction SilentlyContinue }
        Write-Output "NOT_RUNNING"
        exit 0
    }

    try {
        Stop-Process -Id $server.Pid -Force -ErrorAction Stop
        Start-Sleep -Seconds 1
    }
    catch {
        Write-Output "ERROR:$($_.Exception.Message)"
        exit 1
    }

    $childProcs = Get-CimInstance Win32_Process | Where-Object {
        $_.ParentProcessId -eq $server.Pid -or $_.ParentProcessId -eq (Get-CimInstance Win32_Process -Filter "ProcessId=$($server.Pid)").ParentProcessId
    }
    foreach ($cp in $childProcs) {
        try { Stop-Process -Id $cp.ProcessId -Force -ErrorAction SilentlyContinue } catch {}
    }

    if (Test-Path $pidFile) { Remove-Item $pidFile -Force -ErrorAction SilentlyContinue }
    Write-Output "STOPPED"
    exit 0
}

if ($args[0] -eq "log") {
    if (-not (Test-Path $logFile)) {
        Write-Output "LOG_NOT_FOUND"
        exit 1
    }
    try {
        Get-Content -Path $logFile -Wait -Tail 30
    }
    catch {
        exit 0
    }
    exit 0
}

Write-Output "USAGE: powershell -ExecutionPolicy Bypass -File metlas.ps1 {status|start-background|stop|log}"
exit 1
