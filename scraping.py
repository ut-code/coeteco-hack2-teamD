import requests
from bs4 import BeautifulSoup
from supabase import Client, create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

response = requests.get('https://onedannote.com')
soup = BeautifulSoup(response.text, 'html.parser')
topMenuElements = soup.find('div', class_='topMenu')
pages = topMenuElements.find_all('a')

productNames = []
prices = []
units = []

for i in range(6):
    pagesUrl = pages[i].get('href')
    res = requests.get('https://onedannote.com' + pagesUrl)
    soup = BeautifulSoup(res.text, 'html.parser')
    elems = soup.find_all('span', class_='productName')
    for elem in elems:
        productNames.append(elem.text)
    elems = soup.find_all('span', class_='latestprice2')
    for elem in elems:
        prices.append(elem.text)
    elems = soup.find_all('span', class_='unit')
    for elem in elems:
        units.append(elem.text)

# Supabaseにデータを挿入
for i in range(len(productNames)):
    data = {
        'name': productNames[i],
        'price': prices[i] if i < len(prices) else None,
        'unit': units[i] if i < len(units) else None
    }
    supabase.table('Products').insert(data).execute()

