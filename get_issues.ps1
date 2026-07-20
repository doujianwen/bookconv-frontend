for(=31; -le 44;++){
   = 'EBO-'+
  Write-Host "---  ---"
  try{
     = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String((multica issue get  --output json 2>)))
     =  | ConvertFrom-Json
    Write-Host "Title: "
    Write-Host "Desc: "
  }catch{Write-Host 'Error fetching'}
}
