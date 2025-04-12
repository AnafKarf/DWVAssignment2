FROM python:3.9-slim

RUN apt update && apt upgrade -y && apt install -y build-essential

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "python -u sender.py & python app.py"]