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

function Get-ServerProcess {
    $procId = $null
    if (Test-Path $pidFile) {
        $procId = Get-Content $pidFile -Raw -ErrorAction SilentlyContinue
        $procId = "$procId".Trim()
    }
    if ($procId -and ($proc = Get-Process -Id $procId -ErrorAction SilentlyContinue)) {
        return @{ Process = $proc; Pid = $procId }
    }
    elseif ($procId) {
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    }
    $proc = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        try { $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine
            $cmd -match "next dev|npm" } catch { $false }
    } | Select-Object -First 1
    if ($proc) {
        return @{ Process = $proc; Pid = $proc.Id }
    }
    return $null
}

function Get-PortOwner {
    $conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) { return $conn.OwningProcess }
    return $null
}

if ($args[0] -eq "status") {
    $server = Get-ServerProcess
    $portPid = Get-PortOwner
    $ip = Get-LocalIP
    $uptime = "00:00:00"

    if ($server) {
        $p = $server.Process
        $startTime = $p.StartTime
        $elapsed = [DateTime]::Now - $startTime
        $uptime = "{0:D2}:{1:D2}:{2:D2}" -f $elapsed.Hours, $elapsed.Minutes, $elapsed.Seconds
        Write-Output "RUNNING"
        Write-Output $server.Pid
        Write-Output $uptime
        Write-Output $ip
    }
    else {
        Write-Output "STOPPED"
        Write-Output "-"
        Write-Output "-"
        Write-Output $ip
    }

    if ($portPid -and -not $server) {
        Write-Output "PORT_BUSY:$portPid"
    }
    else {
        Write-Output "PORT_OK"
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

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    $psi.Arguments = "/c npm.cmd run dev >> `"$logFile`" 2>&1"
    $psi.WorkingDirectory = $scriptPath
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $p = [System.Diagnostics.Process]::Start($psi)

    Start-Sleep -Seconds 3

    $nodeProc = Get-Process -Name "node" -ErrorAction SilentlyContinue |
        Sort-Object StartTime -Descending | Select-Object -First 1

    if ($nodeProc) {
        $nodeProc.Id | Out-File -FilePath $pidFile -Encoding ASCII
        Write-Output "STARTED:$($nodeProc.Id)"
    } else {
        $p.Id | Out-File -FilePath $pidFile -Encoding ASCII
        Write-Output "STARTED:$($p.Id)"
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
