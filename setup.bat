@echo off

REM 设置环境变量，指定 Python 解释器的路径
set PYTHON_PATH=D:\program\anaconda\envs\api\python.exe

REM 设置 Flask 应用程序的路径
set FLASK_APP=..\\moegoeapi\\MoeGoe.py

REM 设置 Flask 应用程序的运行模式为开发模式
set FLASK_ENV=development

REM 启动 Flask API
%PYTHON_PATH% -m flask run --host=127.0.0.1 --port=5000

start "" npm run start
