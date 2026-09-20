#!/usr/bin/env python3

import os
import uuid

import requests
import json
import logging

class ChannelBuilderTester:
    def __init__(self, host, api_port, frontend_port,
            fresh_username, fresh_password, use_https = False,
            referer_host = None
        ):
        self.sess_keys = dict()
        self.use_https = use_https
        self.host = host
        self.api_port = api_port
        self.username = fresh_username
        self.password = fresh_password
        self.frontend_port = frontend_port
        # The referer/origin the backend accepts (its CORS allow-list).
        # It may differ from the host we actually connect to (e.g. the API
        # on loopback, but a referer on a LAN IP).
        self.referer_host = referer_host if referer_host is not None else host

    def get_origin(self):
        http_trail = "s" if self.use_https else ""
        return f"http{ http_trail }://{ self.referer_host }:{ self.frontend_port }"

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
        sess_key = self.get_sess_key_fe()
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

    # ------------------------------------------------------------------
    # Library endpoints.
    #
    # Unlike the channel helpers above (which return a bool), these return
    # the raw HTTP status code so callers can tell a success (200) apart
    # from a deliberate ownership denial (403). List payloads are stashed
    # on self.last_libraries / self.last_library_entries for inspection.
    # ------------------------------------------------------------------
    @staticmethod
    def _parse_json_list(req):
        # The list endpoints double-encode: a JSON string wrapping a JSON array.
        try:
            data = req.json()
            if isinstance(data, str):
                data = json.loads(data)
            return data if isinstance(data, list) else []
        except Exception:
            return []

    def get_libraries_fe(self):
        sess_key = self.get_sess_key_fe()
        headers = { "referer": self.get_referer(), "Cookie": sess_key, }
        req = requests.get(self.get_url("get_libraries_fe"), headers = headers)
        print(req.text)
        self.last_libraries = self._parse_json_list(req)
        return req.status_code

    def get_library_entries_fe(self, library_id):
        sess_key = self.get_sess_key_fe()
        headers = { "referer": self.get_referer(), "Cookie": sess_key, }
        req = requests.get(
            self.get_url(f"get_library_entries_fe?library_id={ library_id }"),
            headers = headers,
        )
        print(req.text)
        self.last_library_entries = self._parse_json_list(req)
        return req.status_code

    def add_library_entry_fe(self, library_id, name, url, media_type = "video",
            thumbnail_url = None):
        sess_key = self.get_sess_key_fe()
        data = {
            "library_id": library_id,
            "name": name,
            "url": url,
            "media_type": media_type,
        }
        if thumbnail_url is not None:
            data["thumbnail_url"] = thumbnail_url
        headers = { "referer": self.get_referer(), "Cookie": sess_key, }
        req = requests.post(self.get_url("add_library_entry_fe"),
            headers = headers,
            data = data,
        )
        print(req.text)
        return req.status_code

    def remove_library_entry_fe(self, entry_id):
        sess_key = self.get_sess_key_fe()
        headers = { "referer": self.get_referer(), "Cookie": sess_key, }
        req = requests.delete(
            self.get_url(f"remove_library_entry_fe?entry_id={ entry_id }"),
            headers = headers,
        )
        print(req.text)
        return req.status_code

    def create_library_fe(self, name):
        sess_key = self.get_sess_key_fe()
        data = { "name": name, }
        headers = { "referer": self.get_referer(), "Cookie": sess_key, }
        req = requests.post(self.get_url("create_library_fe"),
            headers = headers,
            data = data,
        )
        print(req.text)
        return req.status_code

    def remove_library_fe(self, library_id):
        sess_key = self.get_sess_key_fe()
        headers = { "referer": self.get_referer(), "Cookie": sess_key, }
        req = requests.delete(
            self.get_url(f"remove_library_fe?library_id={ library_id }"),
            headers = headers,
        )
        print(req.text)
        return req.status_code


def run_library_suite(owner, other):
    """Exercise the library endpoints across two users to prove ownership.

    ``owner`` and ``other`` are ChannelBuilderTester instances for two
    distinct, already-authenticated accounts. Runs the full matrix
    (visibility, can_edit flags, owner CRUD, cross-user denials, and the
    global library being immutable to everyone), then deletes the test
    library it created. Returns True only if every check passes.
    """
    results = []
    def check(desc, ok):
        results.append(bool(ok))
        print(f"    { 'PASS' if ok else 'FAIL' }: { desc }")

    # 1. Owner creates a private library
    lib_name = f"tester-lib-{ uuid.uuid4().hex[:8] }"
    check("owner create_library_fe", owner.create_library_fe(lib_name) == 200)
    owner.get_libraries_fe()
    own = next((l for l in owner.last_libraries if l.get("name") == lib_name), None)
    check("owner sees own library", own is not None)
    check("own library has can_edit True", bool(own and own.get("can_edit") is True))
    check("own library has an owner_user_id", bool(own and own.get("owner_user_id") is not None))
    lib_id = own["id"] if own else -1

    # 2. The other user cannot even see the owner's library
    other.get_libraries_fe()
    check("other does NOT see owner's library",
          all(l.get("name") != lib_name for l in other.last_libraries))

    # 3. The global library is visible to everyone, editable by nobody
    owner.get_libraries_fe()
    glob = next((l for l in owner.last_libraries if l.get("is_global")), None)
    check("global library present (owner view)", glob is not None)
    check("global library has can_edit False (owner)",
          bool(glob and glob.get("can_edit") is False))
    other.get_libraries_fe()
    glob2 = next((l for l in other.last_libraries if l.get("is_global")), None)
    check("global library has can_edit False (other)",
          bool(glob2 and glob2.get("can_edit") is False))
    glob_id = glob["id"] if glob else 1
    check("other can read global entries", other.get_library_entries_fe(glob_id) == 200)
    g_entry_id = (other.last_library_entries[0]["id"]
                  if other.last_library_entries else -1)

    # 4. Owner adds an entry to their own library
    entry_name = f"tester-entry-{ uuid.uuid4().hex[:8] }"
    check("owner add_library_entry_fe to own lib",
          owner.add_library_entry_fe(lib_id, entry_name,
              "https://example.com/test.mp4", "video") == 200)
    owner.get_library_entries_fe(lib_id)
    added = next((e for e in owner.last_library_entries
                  if e.get("name") == entry_name), None)
    check("owner sees the added entry", added is not None)
    entry_id = added["id"] if added else -1

    # 5. The other user is denied (403) on the owner's library
    check("other add to owner's lib -> 403",
          other.add_library_entry_fe(lib_id, "intruder-entry",
              "https://example.com/x.mp4", "video") == 403)
    check("other remove owner's entry -> 403",
          other.remove_library_entry_fe(entry_id) == 403)
    check("other read owner's entries -> 403",
          other.get_library_entries_fe(lib_id) == 403)
    check("other delete owner's library -> 403",
          other.remove_library_fe(lib_id) == 403)

    # 6. Nobody can modify the global library
    check("owner add to global lib -> 403",
          owner.add_library_entry_fe(glob_id, "global-intruder",
              "https://example.com/g.mp4", "video") == 403)
    check("other remove global entry -> 403",
          other.remove_library_entry_fe(g_entry_id) == 403)
    check("owner delete global lib -> 403",
          owner.remove_library_fe(glob_id) == 403)

    # 7. Owner removes their own entry, then their own library
    check("owner remove own entry",
          owner.remove_library_entry_fe(entry_id) == 200)
    owner.get_library_entries_fe(lib_id)
    check("owner's entry is gone",
          all(e.get("name") != entry_name for e in owner.last_library_entries))
    check("owner remove_library_fe own lib",
          owner.remove_library_fe(lib_id) == 200)
    owner.get_libraries_fe()
    check("owner's library is gone",
          all(l.get("name") != lib_name for l in owner.last_libraries))

    passed = sum(results)
    print(f"  library suite: { passed }/{ len(results) } checks passed")
    return all(results)


if __name__ == "__main__":
    # Config is env-overridable so the same script works against the dev
    # box and other deployments. Defaults target the dev stack: the API on
    # loopback, with a referer host on the backend's CORS allow-list.
    host = os.environ.get("RS_TEST_HOST", "127.0.0.1")
    api_port = os.environ.get("RS_TEST_API_PORT", "10101")
    frontend_port = os.environ.get("RS_TEST_FRONTEND_PORT", "10102")
    referer_host = os.environ.get("RS_TEST_REFERER_HOST", "192.168.122.34")
    username = os.environ.get("RS_TEST_USERNAME", "runningstreamllc+test10@gmail.com")
    password = os.environ.get("RS_TEST_PASSWORD", "123456")

    # Channel content fixture: prefer the (gitignored) test_channel_nice.txt,
    # fall back to the tracked new_channel.json so a fresh checkout runs.
    here = os.path.dirname(os.path.abspath(__file__))
    nice_path = os.path.join(here, "test_channel_nice.txt")
    if os.path.exists(nice_path):
        cust_chan_content = open(nice_path, "r").read()
    else:
        cust_chan_content = open(os.path.join(here, "new_channel.json"), "r").read()

    tester = ChannelBuilderTester(host, api_port, frontend_port, username, password,
        referer_host = referer_host)
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

    # --- Library endpoints + server-side ownership ---------------------
    # Runs the full library matrix (visibility, can_edit flags, owner CRUD,
    # cross-user 403s, global-library immutability) across two throwaway
    # accounts, then deletes the test library it created. Skip with
    # RS_TEST_SKIP_LIBRARY=1.
    if os.environ.get("RS_TEST_SKIP_LIBRARY", "") == "1":
        print("\nSkipping library tests (RS_TEST_SKIP_LIBRARY=1).")
    else:
        print("\n=== Library endpoints / ownership ===")
        owner_user = os.environ.get("RS_TEST_LIB_OWNER",
            f"dataf-agent+libowner-{ uuid.uuid4().hex[:8] }@agentmail.to")
        other_user = os.environ.get("RS_TEST_LIB_OTHER",
            f"dataf-agent+libother-{ uuid.uuid4().hex[:8] }@agentmail.to")
        owner_pw = "LibTester" + uuid.uuid4().hex[:8]
        other_pw = "LibTester" + uuid.uuid4().hex[:8]
        owner = ChannelBuilderTester(host, api_port, frontend_port,
            owner_user, owner_pw, referer_host = referer_host)
        other = ChannelBuilderTester(host, api_port, frontend_port,
            other_user, other_pw, referer_host = referer_host)
        print(f"Creating library test accounts - confirm each from its validation email:\n  { owner_user }\n  { other_user }\n")
        owner.create_fresh_account()
        other.create_fresh_account()
        lib_ok = run_library_suite(owner, other)
        print(f"\nLibrary suite: { 'PASS' if lib_ok else 'FAIL' }")
        print("(Cleanup: the suite deleted its own test library. The two accounts above can be left or removed.)")
