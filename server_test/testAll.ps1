$files = (Get-ChildItem -Path server/areas -Name)

function pathPlusArea
{
    param ([String] $area)
    Write-Output (" node_modules\.bin\mocha server\\areas\" + $area + "\\test\\test.js")
}

foreach ($area in $files){
    Invoke-Expression -Command ( $prefix + (pathPlusArea @($area)) )
}