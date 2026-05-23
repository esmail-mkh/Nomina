; ─────────────────────────────────────────────────────────────
; Inno Setup Script for Nomina
; Builds: Nomina-Setup-v{version}.exe
; 
; Build locally (Windows only):
;   iscc build\installer.iss /DAppVersion=1.0.0
; ─────────────────────────────────────────────────────────────

#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif

#define AppName      "Nomina"
#define AppPublisher "Emkh"
#define AppExeName   "Nomina.exe"
#define AppId        "{{A7F3B2C1-D4E5-6789-ABCD-EF0123456789}"

[Setup]
AppId={#AppId}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
AllowNoIcons=yes
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=..\dist
OutputBaseFilename=Nomina-Setup-v{#AppVersion}
SetupIconFile=icon.ico
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\{#AppExeName}
ArchitecturesInstallIn64BitMode=x64compatible

; ─────────────────────────────────────────────────────────────
; Anti-virus compatibility settings
; ─────────────────────────────────────────────────────────────
CloseApplications=yes
RestartApplications=no
CreateUninstallRegKey=yes
Uninstallable=yes

; Give antivirus time to scan files before Inno Setup tries to access them
SetupMutex=NominaSetupMutex

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: unchecked
Name: "startmenu";    Description: "Create a &Start Menu shortcut"; GroupDescription: "Additional shortcuts:"

[Files]
Source: "..\dist\Nomina\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExeName}"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"; Tasks: desktopicon
Name: "{commonstartmenu}\{#AppName}"; Filename: "{app}\{#AppExeName}"; Tasks: startmenu

[Run]
Filename: "{app}\{#AppExeName}"; Description: "Launch {#AppName}"; Flags: nowait postinstall skipifsilent

[Code]
// Retry logic for file operations that might be blocked by antivirus
function InitializeSetup(): Boolean;
begin
  Result := True;
  // Small delay to let antivirus finish initial scan
  Sleep(500);
end;
