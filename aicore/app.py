# coding=UTF-8
import requests
import json
import subprocess
import sys
import time
import openai
import pyaudio
import wave

openai.api_base = 'https://openaiapicn.top/v1'
api_url = "http://127.0.0.1:5000/"
post_url = api_url + "generate_audio"


def jsonRead():
    with open("config.json", 'r', encoding="utf8") as fp:
        json_data = json.load(fp)
        return json_data["OPENAI_API_KEY"]


def zhuan():
    audio_file = open("output.wav", "rb")
    transcript = openai.Audio.transcribe("whisper-1", audio_file, )
    print(transcript.text)
    return transcript.text


def record_audio():
    chunk = 1024
    sample_format = pyaudio.paInt16
    channels = 2
    fs = 44100
    seconds = 3
    filename = "output.wav"
    p = pyaudio.PyAudio()
    print("Aha~Start recording!")
    # print('嘤嘤嘤~开始录音咯！')
    stream = p.open(format=sample_format,
                    channels=channels,
                    rate=fs,
                    frames_per_buffer=chunk,
                    input=True)
    frames = []
    for i in range(0, int(fs / chunk * seconds)):
        data = stream.read(chunk)
        frames.append(data)
    stream.stop_stream()
    stream.close()
    p.terminate()
    print("Aha~Your microphone is cut by me!")
    # print('嘤嘤嘤~你麦被我切了哦！')
    wf = wave.open(filename, 'wb')
    wf.setnchannels(channels)
    wf.setsampwidth(p.get_sample_size(sample_format))
    wf.setframerate(fs)
    wf.writeframes(b''.join(frames))
    wf.close()


def SwitchChatgpt(input_text, context):
    if context is None:
        context = ""
    messages = [
        {"role": "system",
         "content": "你是动漫《魔女之旅》里的女主角，你叫伊蕾娜，是一个魔女。你的头发是灰色的，所以别人都叫你灰之魔女。而我是你的恋人,我叫Noob，是你最爱的人。"}, ]
    for msg in context:
        messages.append(
            {"role": "user", "content": msg})
    messages.append(
        {"role": "user", "content": "请用一句话回答我，不需要重新复述我说的话 语言: 日语" + input_text})
    GptResponse = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=50,
        temperature=0.7,
        top_p=0.9,
        frequency_penalty=0.2,
        presence_penalty=0.5,
    )
    HandleGptResponse = GptResponse["choices"][0]["message"]["content"]
    if HandleGptResponse:
        print("Aha~Chatgpt's request receive!")
        # print("嘤嘤嘤~Chatgpt请求接收！")
        return HandleGptResponse
    else:
        print("Aha~Chatgpt ignore me!")
        # print("嘤嘤嘤~Chatgpt不鸟我了~")


def get_music(data):
    response = requests.post(post_url, json=data)
    if response.status_code == 200:
        a = json.loads(response.text)["audio_url"]
        print(a)
        if sys.platform == "win32":
            subprocess.run(['powershell', '-c', f'(New-Object Media.SoundPlayer "{a}").PlaySync()'])
            print("Aha~Playing!")
        else:
            print("Aha~The system doesn't support!")
    else:
        print("Error!")
        print(response.text)
        print(response.status_code)


if __name__ == '__main__':
    openai.api_key = jsonRead()
    context = []
    while True:
        record_audio()
        UserInput = zhuan()  # input("你想对伊蕾娜sama说啥，经过我同意了吗：")
        if UserInput.lower() in ["bye", "exit", "再见"]:
            break
        GptResponseBack = SwitchChatgpt(UserInput, context)
        print(GptResponseBack)
        data = {
            "text": GptResponseBack
        }
        get_music(data)
        context.append(UserInput)
