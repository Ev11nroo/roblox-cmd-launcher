import json
import sys
import errors
import uri
import http_local

config = json.load(open("config.json"))
print("config.json:", config)

args = sys.argv
print(args) # starts at index 0