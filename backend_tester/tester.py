#!/usr/bin/env python3

import requests
import json
import logging

class ChannelBuilderTester:
    def __init__(self, host, api_port, frontend_port,
            fresh_username, fresh_password, use_https = False
        ):
        self.sess_keys = dict()
        self.use_https = use_https
        self.host = host
        self.api_port = api_port
        self.username = fresh_username
        self.password = fresh_password
        self.frontend_port = frontend_port

    def get_origin(self):
        http_trail = "s" if self.use_https else ""
        return f"http{ http_trail }://{ self.host }:{ self.frontend_port }"

    def get_referer(self):
        return f"{ self.get_origin() }/"

    def get_url(self, endpoint):
        http_trail = "s" if self.use_https else ""
        return f"http{ http_trail }://{ self.host }:{ self.api_port }/api/v1/{ endpoint }"

    def create_fresh_account(self):
        data = { "username": self.username, "password": self.password, }
        headers = { "referer": self.get_referer(), }
        req = requests.post(self.get_url("create_account"),
            headers = headers,
            data = data,
        )
        notice = "" if req.status_code == 200 else "Creation didn't return 200.  "
        input(f"{notice}Press enter when you've confirmed the account.")
        return req.status_code == 200

    def authenticate_fe(self, username = None, password = None):
        return self.authenticate("fe", username, password)

    def authenticate_ro(self, username = None, password = None):
        return self.authenticate("ro", username, password)

    def authenticate_di(self, username = None, password = None):
        return self.authenticate("di", username, password)

    def authenticate(self, portion, username = None, password = None):
        if username is None:
            username = self.username
            password = self.password
        data = { "username": username, "password": password, }
        headers = { "referer": self.get_referer(), }
        req = requests.post(self.get_url(f"authenticate_{ portion }"),
            headers = headers,
            data = data,
        )
        #print(req.text)
        print(req.headers)
        #print(req.status_code)
        if req.status_code == 200:
            set_cookie = req.headers["set-cookie"]
            cook_end = set_cookie.find(";")
            self.sess_keys[(username, portion)] = set_cookie[:cook_end]
        return req.status_code == 200

    def get_sess_key_fe(self, username = None, password = None):
        return self.get_sess_key("fe", username, password)

    def get_sess_key_ro(self, username = None, password = None):
        return self.get_sess_key("ro", username, password)

    def get_sess_key_di(self, username = None, password = None):
        return self.get_sess_key("di", username, password)

    def get_sess_key(self, portion, username = None, password = None):
        if username is None:
            username = self.username
            password = self.password
        if (username, portion) not in self.sess_keys:
            if not self.authenticate(portion, username = username, password = password):
                logging.error("Failed to authenticate and get session key")
                return ""
        return self.sess_keys[(username, portion)]

    def get_channel_xml_ro(self):
        sess_key = self.get_sess_key_ro()
        headers = { "Cookie": sess_key, }
        req = requests.get(self.get_url("get_channel_xml_ro"),
            headers = headers,
        )
        print(req.text)
        return req.status_code == 200

    def get_channel_list_di(self):
        sess_key = self.get_sess_key_di()
        headers = {
            "Cookie": sess_key,
            "referer": self.get_referer(),
        }
        req = requests.get(self.get_url("get_channel_list_di?list_name=First Channel"),
            headers = headers,
        )
        print(req.text)
        return req.status_code == 200

    def get_active_channel_di(self):
        sess_key = self.get_sess_key_di()
        headers = {
            "Cookie": sess_key,
            "referer": self.get_referer(),
        }
        req = requests.get(self.get_url("get_active_channel_di"),
            headers = headers,
        )
        print(req.text)
        return req.status_code == 200

    def get_active_channel_name_fe(self):
        sess_key = self.get_sess_key_di()
        headers = {
            "Cookie": sess_key,
            "referer": self.get_referer(),
        }
        req = requests.get(self.get_url("get_active_channel_name_fe"),
            headers = headers,
        )
        print(req.text)
        return req.status_code == 200

    def refresh_session_ro(self):
        portion = "ro"
        username = self.username

        sess_key = self.get_sess_key_ro()
        headers = { "Cookie": sess_key, }
        req = requests.get(self.get_url("refresh_session_ro"),
            headers = headers,
        )
        print(req.headers)
        if req.status_code == 200:
            set_cookie = req.headers["set-cookie"]
            cook_end = set_cookie.find(";")
            self.sess_keys[(username, portion)] = set_cookie[:cook_end]
        print(self.sess_keys[(username, portion)])
        return req.status_code == 200

    def get_status_report(self):
        #sess_key = self.get_sess_key_fe()
        headers = { "referer": self.get_referer(), } # "Cookie": sess_key, }
        req = requests.get(self.get_url("status_report"),
            headers = headers,
        )
        print(req.text)
        return req.status_code == 200
        
    def set_channel_list_fe(self, name=None, data=None):
        sess_key = self.get_sess_key_fe()
        data = {
            "listname": name if name is not None else "First Channel",
            "listdata": data if data is not None else json.dumps({
                "entries": [
                    {"name": "First", "image": "", "videourl": "https://archive.org/download/popeye-pubdomain/A_Date_to_Skate.mp4", "videotype": "mp4", "loop": False, "type": "video"},
                    {"name": "Second", "image": "", "videourl": "https://archive.org/download/popeye-pubdomain/A_Haul_in_One.mp4", "videotype": "mp4", "loop": False, "type": "video"},
                ],
            }),
        }
        headers = { "referer": self.get_referer(), "Cookie": sess_key, }
        req = requests.post(self.get_url("set_channel_list_fe"),
            headers = headers,
            data = data,
        )
        print(req.text)
        return req.status_code == 200

    def create_channel_list_fe(self, name):
        sess_key = self.get_sess_key_fe()
        data = {
            "listname": name,
        }
        headers = { "referer": self.get_referer(), "Cookie": sess_key, }
        req = requests.post(self.get_url("create_channel_list_fe"),
            headers = headers,
            data = data,
        )
        print(req.text)
        return req.status_code == 200

    def delete_channel_fe(self, name):
        sess_key = self.get_sess_key_fe()
        headers = { "referer": self.get_referer(), "Cookie": sess_key, }
        req = requests.delete(self.get_url(f"delete_channel_fe?listname={name}"),
            headers = headers,
        )
        print(req.text)
        return req.status_code == 200

    def set_active_channel_fe(self, name):
        sess_key = self.get_sess_key_fe()
        data = {
            "listname": name,
        }
        headers = { "referer": self.get_referer(), "Cookie": sess_key, }
        req = requests.post(self.get_url("set_active_channel_fe"),
            headers = headers,
            data = data,
        )
        print(req.text)
        return req.status_code == 200


if __name__ == "__main__":
    host = "192.168.86.11"
    api_port = "3031"
    frontend_port = "5173"
    username = "runningstreamllc+test10@gmail.com"
    password = "123456"

    cust_chan_content = open("test_channel_nice.txt", "r").read()

    tester = ChannelBuilderTester(host, api_port, frontend_port, username, password)
    tests = [
        ("Create Account", tester.create_fresh_account),
        ("Authenticate Frontend", tester.authenticate_fe),
        ("Authenticate Roku", tester.authenticate_ro),
        ("Authenticate Display", tester.authenticate_di),
        ("Get Channel XML Roku", tester.get_channel_xml_ro),
        ("Refresh Session Roku", tester.refresh_session_ro),
        ("Set Channel List", tester.set_channel_list_fe),
        ("Get Channel List Display", tester.get_channel_list_di),
        ("Get Active Channel Display", tester.get_active_channel_di),
        ("Get Channel XML Roku", tester.get_channel_xml_ro),
        ("Create New Channel List", tester.create_channel_list_fe, "Custom List"),
        ("Create New Channel List", tester.create_channel_list_fe, "Will Be Deleted"),
        ("Set New Channel List", tester.set_channel_list_fe, "Custom List", cust_chan_content),
        ("Set Active Channel", tester.set_active_channel_fe, "Custom List"),
        ("Get Active Channel Name", tester.get_active_channel_name_fe),
        ("Delete Channel", tester.delete_channel_fe, "Will Be Deleted"),
        ("Get Channel XML Roku", tester.get_channel_xml_ro),
        ("Get Status Report", tester.get_status_report),
    ]

    def run_test(name, func, *args):
        print(f"TEST: {name}")
        return func(*args)

    results = [(name, run_test(name, func, *args)) for (name, func, *args) in tests]

    for (name, result) in results:
        print(f"{ name }: { result }")
