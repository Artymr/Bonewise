Set WshShell = CreateObject("WScript.Shell")

projectPath = WScript.ScriptFullName
projectPath = Left(projectPath, Len(projectPath) - Len(WScript.ScriptName))

WshShell.CurrentDirectory = projectPath

WshShell.Run "cmd /c npm start", 0, False

WScript.Sleep 3000

WshShell.Run "http://localhost:3000", 1, False

Set WshShell = Nothing
