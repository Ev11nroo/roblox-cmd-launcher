import json
import sys

config = json.load(open("config.json"))
print("config.json:", config)

args = sys.argv
print(args) # starts at index 0