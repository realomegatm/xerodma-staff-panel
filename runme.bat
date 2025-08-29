@echo off setlocal enabledelayedexpansion

:: Set project root set PROJECT_ROOT=C:\Users\justx\Desktop\xerodma-staff-panel

:: Change to project root cd /d "%PROJECT_ROOT%"

:: Create missing directories only if not exist app\api\auth[...nextauth] mkdir app\api\auth[...nextauth] if not exist app\api\guides mkdir app\api\guides if not exist app\api\guides\verify mkdir app\api\guides\verify if not exist app\api\guides\update mkdir app\api\guides\update if not exist scripts mkdir scripts

:: Create empty files echo. > lib\mysql.ts echo. > app\api\auth[...nextauth]\route.ts echo. > middleware.ts echo. > app\layout.tsx echo. > app\staff\page.tsx echo. > app\api\guides\route.ts echo. > app\api\guides\verify\route.ts echo. > app\api\guides\update\route.ts echo. > app\guides\page.tsx echo. > app\staff\dashboard\page.tsx echo. > app\staff\dashboard\guides\page.tsx echo. > scripts\hashPasswords.js

echo Done creating directories and files. pause