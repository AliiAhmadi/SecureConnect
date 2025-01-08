# connect

![image](https://github.com/user-attachments/assets/cc4dc35b-0883-4fdc-b5b5-b0a84b45baa9)

# آموزش مفاهیم webrtc
اولین جز که به آن می پردازیم signaling server است.
در واقع signaling server ربطی به webrtc ندارد و جریی از آن به حساب نمی آید بلکه تنها فراهم کننده و کمک کننده است که دیتای مورد نیاز اولیه برای برقراری و پایداری ارتباط منتقل شود. برای signaling می توانیم از هر چیزی استفاده کنیم. ماثلا webSocket یا XMLHttpRequest.

قسمت بعدی که در تصویر بالا دیده می شود STUN server می باشد. کار STUN server این است که اطلاعات مربوط به اینترنت و مسیر اتصال ما به اینترنت و جزییات مربوط به NAT و ... را به ما بر میگرداند. قبل از برقراری ارتباط با طرف مقابل باید از STUN server این اطلاعات را بگیریم و سپس این اطلاعات را می توانیم با signaling server به طرف مقابل بدهیم.
البته در اکثر مواقع STUN کار نخواهد کرد و باید از TURN استفاده کنیم.

در واقع از TURN زمانی استفاده می کنیم که STUN با مشکل مواجه شود. TURN سرورها معمولا رایگان نیستند و علت آن هزینه زیادی است که به علت عبور ترافیک از آنها باید پرداخت شود. در واقع اگر ارتباط P2P نتواند برقرار شود ترافیک از طریق TURN سرور تبادل می شود.

همانطور که می دانیم برای برقراری ارتباط بین دو کلاینت به انتقال اولیه بعضی داده ها داریم. یکی از آنها SDP می باشد. (Session description protocol) در واقع شامل داده هایی می باشد که دو طرف باید از نوع مدیا هم دیگر بدانند تا بتوانند ارتباط درستی داشته باشند. SDP از طریق signaling server منتقل می شود. بعد از SDP دیتای بعدی که باید منتقل شود ICE Candidate می باشد که در واقع اطلاعات مربوط به اینترنت می باشد که از STUN گرفته می شود.


![image](https://github.com/user-attachments/assets/186db96c-3c5b-43ee-b811-36e0f0af7793)

اولین قدم برای شروع ارسال webrtc offer می باشد که در واقع شامل SDP درخواست دهنده می باشد بعد از آن جوابی که طرف مقابل باید بدهد شامل SDP خودش می باشد که بهش webrtc response می گویند.

![image](https://github.com/user-attachments/assets/fc217f57-f355-42fc-b12c-78a55031a0a0)


![image](https://github.com/user-attachments/assets/8d4c476f-5639-4116-b357-2f58914e139d)

و در نهایت تماس برقرار می شود.

![image](https://github.com/user-attachments/assets/1cd1f223-0142-4500-a9d7-70e28604273c)
