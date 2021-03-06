window.DEBUG_OUTPUT = true;

$(document).ready(main);

function main() {
    debug_log("main starting");

    let screen_props = {
        head_area: $("#header_area"),
        draw_area: $("#screen_area"),
        foot_area: $("#footer_area"),
        pops_back: $("#popup_back"),
        pops_area: $("#popup_area"),
        spin_back: $("#spinner_back"),
        demo_area: $("#demo_channels"),
    };

    window.SCREEN_PROPS = Object.assign({}, screen_props);

    // See if this is a registration request
    if( get_subpage() == "validation" ) {
        debug_log("main -> ValidationScreen");
        let val_screen = new ValidationScreen();
        val_screen.draw();
    }
    // See if this is the signup page
    else if( get_subpage() == "signup" ) {
        debug_log("main -> RegisterScreen");
        let reg_screen = new RegisterScreen();
        reg_screen.draw();
    }
    else {
        // Determine if we already have a valid session id, and if so jump to the main screen
        validate_sess_to_main_or_login();
    }
}

function UIScreen() {}

UIScreen.prototype.clear = function () {
    let screen_props = window.SCREEN_PROPS;
    $("body")[0].className = "";
    screen_props.head_area.empty();
    screen_props.draw_area.empty();
    screen_props.foot_area.empty();
    screen_props.pops_area.empty();
}

UIScreen.prototype.draw = function () {
    debug_log("UIScreen draw");
    this.clear();
    draw_area.append($("You drew the UIScreen.  That should never happen."));
    console.error("You drew the UIScreen.  That should never happen.");
}

function LoginScreen() {
    UIScreen.call(this);
}

LoginScreen.prototype = Object.create(UIScreen.prototype);
Object.defineProperty(LoginScreen.prototype, 'constructor', {
    value: LoginScreen,
    enumerable: false,
    writable: true 
});

LoginScreen.prototype.draw = function () {
    debug_log("LoginScreen draw");
    this.clear();
    if( get_subpage() != "" ) {
        debug_log("LoginScreen displayed unexpectedly...");
    }
    $("body").addClass("login_page");

    let intro_section = $( 
        '<section id="login_intro">' +
        '</section>'
    );
    let intro_text = $( 
        '<div id="login_intro_text">' +
        '<h1>Running Stream</h1>' +
        '<h2>Your Personal Roku Channel</h2>' +
        '<br/>' +
        '<a href="/?signup=" class="input_button">Sign Up</a>' +
        '<a href="#login_login" class="input_button">Sign In</a>' +
        '</div>'
    );
    let usecases_section = $(
        '<section id="login_usecases">' +
        '<h1>Why?</h1>' +
        '<p>Tap the baby example for a demo...</p>' +
        '</section>'
        );
    let baby_usecase = $(
        '<div class="usecase">' +
        '<img src="img/baby.svg" />' +
        '<p>Build a channel just for your child</p>' +
        '</div>'
        ).click(function() { disp_demo("#baby_demo"); });
    let other_usecases = $(
        '<div class="usecase">' +
        '<img src="img/videotape.svg" />' +
        '<p>Home videos on demand</p>' +
        '</div>' +
        '<div class="usecase">' +
        '<img src="img/musicparty.svg" />' +
        '<p>Stream your party mix!</p>' +
        '</div>' +
        '<div class="usecase">' +
        '<img src="img/mortarboard.svg" />' +
        '<p>Put a graduate compilation on loop</p>' +
        '</div>' +
        '<div class="usecase">' +
        '<img src="img/shop.svg" />' +
        "<p>Loop your shop's promo video</p>" +
        '</div>'
        );
    let trailer_section = $(
        '<section id="login_trailer">' +
        '<h2>Free.  No catch.</h2>' +
        '<h3><a href="https://github.com/runningstream/channel_builder">Source Code Here</a></h3>' +
        "<p>Why?  We're nerds and we use this ourselves.  It doesn't cost us much to let others in too.</p>" +
        '<p><a href="mailto:runningstreamllc@gmail.com">Contact Us</a><a href="https://docs.runningstream.cc/privacy_policy/">Privacy Policy</a></p>' +
        '</section>'
    );
    let docs_section = $(
        '<section id="login_docs">' +
        '<h2>Apps</h2>' +
        '<h3><a href="https://channelstore.roku.com/details/707afc86801deb28e35d3984cdc59b68/running-stream">Roku Channel</a></h3>' +
        '<h2>Documentation</h2>' +
        '<h3><a href="https://docs.runningstream.cc/">Getting Started</a></h3>' +
        '</section>'
    );
    let intro_sec_two = $(
        '<section id="login_intro2">' +
        '<div>Stream your videos, through your channel.  Build it quickly and easily.</div>' +
        "<div>Typically with a Roku or other streaming device you're limited to streaming content someone else has provided.  With Running Stream you can stream your personal or business videos through your Roku easily.</div>" +
        '</section>'
    );
    let login_section = $(
        '<section id="login_login">' +
        '</section>'
    );
    let login_form = $(
        '<form>' +
        '<div>' +
        '<label for="login_username">Username:</label>' +
        '<input type="text" id="login_username" autocomplete="username">' +
        '</div>' +
        '<div>' +
        '<label for="login_password">Password:</label>' +
        '<input type="password" id="login_password" autocomplete="current-password">' +
        '</div>' +
        '</form>' )
        .submit(function() {
            let login_dat = {
                "username": $("#login_username").val(),
                "password": $("#login_password").val(),
            };
            make_api_request("authenticate_fe",
                {"method": "POST", "data": login_dat}, true,
                function() {
                    // TODO determine if we now have a session id, and if so, jump to the next part, otherwise display failure
                    debug_log("LoginScreen authenticate_fe success");
                    let main_screen = new MainScreen();
                    main_screen.draw();
                },
                function(jqXHR, text_status, asdf) {
                    debug_log("LoginScreen authenticate_fe failed");
                    display_popup("Login Failed");
                }
            );

            // Return false to cancel the submit action
            return false;
        });
    let login_button = $( '<input type="submit" value="Login">' );
    let register_button = $(
        '<a href="/?signup=" class="input_button">Register</a>'
        );

    let button_div = $('<div></div>');
    button_div.append(login_button);
    button_div.append(register_button);
    login_form.append(button_div);
    intro_section.append(intro_text);
    login_section.append(login_form);

    usecases_section.append(baby_usecase);
    usecases_section.append(other_usecases);

    let screen_props = window.SCREEN_PROPS;
    screen_props.draw_area.append(intro_section);
    screen_props.draw_area.append(intro_sec_two);
    screen_props.draw_area.append(usecases_section);
    screen_props.draw_area.append(login_section);
    screen_props.draw_area.append(docs_section);
    screen_props.draw_area.append(trailer_section);
}

function RegisterScreen() {
    UIScreen.call(this);
}

RegisterScreen.prototype = Object.create(UIScreen.prototype);
Object.defineProperty(RegisterScreen.prototype, 'constructor', {
    value: RegisterScreen,
    enumerable: false,
    writable: true 
});

RegisterScreen.prototype.draw = function () {
    debug_log("RegisterScreen draw");
    this.clear();
    if( get_subpage() != "signup" ) {
        debug_log("RegisterScreen displayed unexpectedly...");
    }
    $("body").addClass("register_page");

    let intro_content = $( 
        '<section>' +
        '<h1>Sign up now!</h1>' +
        '</section>'
    );
    let trailer_section = $(
        '<section>' +
        '<p><a href="https://docs.runningstream.cc/privacy_policy/">Full Privacy Policy</a> - in short, we will never give anyone else your information.  You will only ever receive a signup confirmation email from us.</p>' +
        '</section>'
    );
    let register_form = $( 
        '<form>' +
        '<div>' +
        '<label for="reg_username">Email Address:</label>' +
        '<input type="text" id="reg_username" autocomplete="username">' +
        '</div>' +
        '<div>' +
        '<label for="reg_password">Password:</label>' +
        '<input type="password" id="reg_password" autocomplete="current-password">' +
        '</div>' +
        '<div>' +
        '<label for="verify_password">Verify Password:</label>' +
        '<input type="password" id="verify_password" autocomplete="current-password">' +
        '</div>' +
        '</form>'
    )
        .submit(function() { 
            if( $("#reg_password").val() != $("#verify_password").val() ) {
                display_popup("Passwords do not match!");
                return false;
            }
            if( $("#reg_password").val().length < 5 ) {
                display_popup("Password must be longer than 5 characters.");
                return false;
            }
            let reg_dat = {
                "username": $("#reg_username").val(),
                "password": $("#reg_password").val(),
            };
            make_api_request("create_account",
                {"method": "POST", "data": reg_dat}, true,
                function() {
                    // TODO determine whether it was successful and display a message
                    display_popup(
                        "User account requested, look for an email...",
                        validate_sess_to_main_or_login
                    );
                },
                function() {
                    // TODO determine reason for failure and take action
                    display_popup(
                        "User account creation failed!  Perhaps the email address is already registered."
                    );
                }
            );
            return false;
        });
    let password_note = $(
        "<h4>You will need to enter this password on your streaming device later, so choose one that won't be too difficult.</h4>"
    );
    let register_section = $(
        '<section>' +
        '</section>'
    );
    let register_button = $( '<input type="submit" value="Register">' );
    register_form.append(register_button);
    register_section.append(register_form);
    register_section.append(password_note);

    let screen_props = window.SCREEN_PROPS;
    screen_props.draw_area.append(intro_content);
    screen_props.draw_area.append(register_section);
    screen_props.draw_area.append(trailer_section);
}

function ValidationScreen() {
    UIScreen.call(this);
}

ValidationScreen.prototype = Object.create(UIScreen.prototype);
Object.defineProperty(ValidationScreen.prototype, 'constructor', {
    value: ValidationScreen,
    enumerable: false,
    writable: true 
});

ValidationScreen.prototype.draw = function () {
    debug_log("ValidationScreen draw");
    this.clear();
    if( get_subpage() != "validation" ) {
        debug_log("ValidationScreen displayed unexpectedly...");
    }
    $("body").addClass("validation_page");

    let val_welcome = $( '<h2>Welcome to Running Stream!</h2>' +
        '<p>Register here!  If you didn\'t request to register, or you no longer wish to receve registration emails, just delete the one you received.  You will not receive any further communications from this service</p>'
    );
    let val_form = $( '<form>' +
            '</form>')
        .submit(function() {
            const urlParams = new URLSearchParams(window.location.search);
            const val_code = urlParams.get("val_code");

            make_api_request(
                "validate_account?val_code="+val_code,
                {"method": "GET"}, true,
                function() {
                    // TODO determine whether it was successful and display a message
                    debug_log("validate_account success");
                    display_popup("User validation successful!  Now login.",
                        validate_sess_to_main_or_login
                    );
                },
                function(jqXHR, textStatus, errorThrown) {
                    debug_log("validate_account fail");
                    // TODO test the part below, perhaps display in a nicer way
                    if( jqXHR.status == 403 ) {
                        display_popup("Invalid validation code!", validate_sess_to_main_or_login);
                    } else {
                        display_popup("Validation failed.", validate_sess_to_main_or_login);
                    }
                }
            );
            return false;
        });
    let validate_button = $( '<input type="submit" value="Validate Account">' );

    val_form.append(validate_button);

    let screen_props = window.SCREEN_PROPS;
    screen_props.draw_area.append(val_welcome);
    screen_props.draw_area.append(val_form);
}

function MainScreen() {
    UIScreen.call(this);
}

MainScreen.prototype = Object.create(UIScreen.prototype);
Object.defineProperty(MainScreen.prototype, 'constructor', {
    value: MainScreen,
    enumerable: false,
    writable: true 
});

MainScreen.prototype.draw = function () {
    debug_log("MainScreen draw");
    this.clear();
    if( get_subpage() != "" ) {
        debug_log("MainScreen displayed unexpectedly...");
    }
    $("body").addClass("mainscreen_page");

    let content = $( '<div id="content"></div>' );
    let name_area = $( '<div id="hdr_name">Running Stream</div>' );
    let mgmt_button_area = $( '<div id="mgmt_btns"></div>' );
    let channel_list_area = $( '<div id="chan_list"></div>' );
    let channel_edit_area = $( '<div id="chan_edit"></div>' );

    let channel_list_list = new ChannelListList(channel_edit_area);
    channel_list_list.draw(channel_list_area);

    let logout_button = $( '<div id="logout_button" title="Logout"></div>' )
        .click(function() {
            make_api_request("logout_session_fe", {"method": "GET"},
                true,
                validate_sess_to_main_or_login,
                validate_sess_to_main_or_login
            );
        });

    let help_button = $( '<a href="https://docs.runningstream.cc/" target="__blank__" id="help_button" title="Documentation"></a>' )

    mgmt_button_area.append(help_button);
    mgmt_button_area.append(logout_button);

    //let profile_area = $('<div id="profile_button"></div>');
    //mgmt_button_area.append(profile_area);

    content.append(channel_list_area);
    content.append(channel_edit_area);

    let screen_props = window.SCREEN_PROPS;
    screen_props.head_area.append(name_area);
    screen_props.head_area.append(mgmt_button_area);
    screen_props.draw_area.append(content);
}

function ChannelListList(channel_list_edit_area) {
    this.channel_list_list_area = $( "<div></div>" );
    this.channel_list_edit_area = channel_list_edit_area;
    this.channel_list_list = [];
    this.selected_list = null;

    this.get_channel_lists_from_server();
}

ChannelListList.prototype.get_channel_lists_from_server = function () {
    let channellistlist = this;
    make_api_request("get_channel_lists", {"method": "GET"},
        false,
        function(data_str) {
            channellistlist.channel_list_list = JSON.parse(data_str);
            channellistlist.draw_channel_list_list();
        },
        function() {
            display_popup(
                "Getting channel lists failed.",
                validate_sess_to_main_or_login
            );
        }
    );
}

ChannelListList.prototype.draw = function (draw_area) {
    debug_log("ChannelListList draw");
    draw_area.children().detach();
    draw_area.append(this.channel_list_list_area);
}

ChannelListList.prototype.draw_channel_list_list = function () {
    let channel_list_list = this;

    let channel_list = $( '<div id="chan_list_list"></div>' );

    let new_channel_list_area = $( "<form>" +
        '<label for="new_channel_list_name">New Channel List Name:</label>' +
        '<input type="text" id="new_channel_list_name">' +
        "</form>" );


    let create_channel_list_button = 
        $( '<input type="button" value="Create Channel List">' )
        .click(function() {
            let listname = $("#new_channel_list_name").val().trim();
            if( listname.length < 1 ) {
                display_popup("Invalid channel list name.");
                return false;
            }
            let data = {
                "listname": listname,
            };
            make_api_request("create_channel_list",
                {"method": "POST", "data": data}, 
                true,
                function() {
                    channel_list_list.channel_list_list.push(data["listname"]);
                    channel_list_list.draw_channel_list_list();
                },
                function() {
                    display_popup(
                        "Creating the channel list failed..."
                    );
                }
            );
        });

    new_channel_list_area.append(create_channel_list_button);

    let set_active_channel_list_button = 
        $( '<input type="button" value="Set Active List">' )
        .click(function() {
            let curr_sel = channel_list_list.currently_selected;
            if( curr_sel == null ) {
                return;
            }
            let data = {
                "listname": channel_list_list.currently_selected.channel_name,
            };
            make_api_request("set_active_channel",
                {"method": "POST", "data": data},
                true,
                function() {
                    display_popup("Active channel set.");
                },
                function() {
                    display_popup(
                        "Setting the active channel failed.",
                        validate_sess_to_main_or_login
                    );
                }
            );
        });
    new_channel_list_area.append(set_active_channel_list_button);

    this.channel_list_list.forEach(function (channel_name) {
        let channel = $( '<div class="sel_list_ent"></div>' ).text(channel_name);
        let channellist = new ChannelList(channel_name);
        channel.click(function() {
            channellist.draw(channel_list_list.channel_list_edit_area);
            channel_list_list.set_selection(channellist, channel.get()[0]);
        });
        channel_list.append(channel);
    });

    this.channel_list_list_area.children().detach();
    this.channel_list_list_area.append(channel_list);
    this.channel_list_list_area.append(new_channel_list_area);
}

ChannelListList.prototype.set_selection = function(channel_list, domelem) {
    this.currently_selected = channel_list;
    $(".selected").removeClass("selected");
    domelem.classList.add("selected");
}

function ChannelList(channel_name) {
    this.channel_name = channel_name;
    this.channel_list_edit_area = $("<div></div>");
    this.channel_list = {"entries": []};
    this.ui_only_entry_props = ["expanded"];
    this.currently_selected = null;

    this.get_channel_list_from_server();
}

ChannelList.prototype.draw = function (draw_area) {
    debug_log("ChannelList draw");
    draw_area.children().detach();
    draw_area.append(this.channel_list_edit_area);
}

ChannelList.prototype.get_channel_list_from_server = function () {
    let channellist = this;
    make_api_request(
        "get_channel_list?list_name="+this.channel_name,
        {"method": "GET"}, false,
        function(data_str) {
            channellist.channel_list = JSON.parse(data_str);
            channellist.draw_channel_list();
        },
        function() {
            display_popup(
                "Getting channel list failed.",
                validate_sess_to_main_or_login
            );
        }
    );
}

ChannelList.prototype.put_channel_list_to_server = function() {
    let channellist = this;
    const to_strip = this.ui_only_entry_props;

    let strip_ui_specific = function(entry) {
        let new_ent = {};
        for( key in entry ) {
            if( key == "entries" ) {
                new_ent[key] = entry.entries.map( strip_ui_specific );
            } else if( ! to_strip.includes(key) ) {
                new_ent[key] = entry[key];
            }
        }
        return new_ent;
    };

    let list_dat = {
        "listname": this.channel_name,
        "listdata": JSON.stringify(strip_ui_specific(this.channel_list)),
    };
    make_api_request("set_channel_list", {"method": "POST", "data": list_dat},
        false,
        function(data_str) {
            debug_log("Successful update");
        },
        function() {
            display_popup(
                "Updating channel list failed.",
                validate_sess_to_main_or_login
            );
        }
    );
}

let sublist_dialog_content = function(cur_entry=undefined) {
    if(cur_entry === undefined) {
        cur_entry = {"name": "", "image": ""};
    }
    return $( '<div class="block_labels">' +
        '<label>Name: <input type="text" id="pop_addname" value="' + cur_entry.name + '"></label>' +
        '<label>Image URL: <input type="text" id="pop_imageurl" value="' + cur_entry.image + '"></label>' +
        '</div>' );
}

let media_dialog_content = function(cur_entry=undefined) {
    if(cur_entry === undefined) {
        cur_entry = {"name": "", "image": "", "videourl": "",
            "videotype": "mp4", "loop": false};
    }
    let loop_checked = cur_entry.loop ? " checked" : "";
    let content = $('<div class="block_labels">' +
        '<label>Name: <input type="text" id="pop_addname" value="' + cur_entry.name + '"></label>' +
        '<label>Image URL: <input type="text" id="pop_imageurl" value="' + cur_entry.image + '"></label>' +
        '<label>Media URL: <input type="text" id="pop_videourl" value="' + cur_entry.videourl + '"></label>' +
        '<label>Loop Media: <input type="checkbox" id="pop_loopmedia"' + loop_checked + '></label>' +
        '<label>MP4 <input type="radio" value="mp4" name="pop_videnctype"></label>' +
        '<label>Audio <input type="radio" value="audio" name="pop_videnctype"></label>' +
        '</div>' );
    content.find('input[name="pop_videnctype"][value="' + cur_entry.videotype + '"]').prop('checked', true);
    return content;
}

ChannelList.prototype.draw_channel_list = function() {
    let channellist = this;
    channellist.channel_list.type="sublist";
    channellist.channel_list.name=channellist.channel_name;
    let channel_edit_list = $( '<div></div>' );

    let recursive_render = function(entry, ent_par, ent_par_ind, cur_disp_pos) {
        let ent_disp = $( '<div class="sel_list_ent"></div>' );
        ent_disp.click(function(ev) {
            channellist.set_selection(entry, ent_disp.get()[0]); 

            // Prevent the click from bubbling up to higher level divs
            if( !ev ) {
                var ev = window.event;
            }
            ev.cancelBubble = true;
            if( ev.stopPropagation ){
                ev.stopPropagation();
            }
        });
        if( entry.type == "sublist" ) {
            ent_disp.append( $("<div></div>").text(entry.name));
            let sublist_area = $('<details></details>')
                .on('toggle', function(ev) {
                    entry.expanded = ev.target.open;
                });
            if( entry.expanded == true ) {
                sublist_area[0].open = true;
            } else {
                sublist_area[0].open = false;
            }
            let sublist_summ = $("<summary>Sublist:</summary>");
            let sublist_button_div = $('<div></div>');
            let sublist_div = $('<div></div>');
            sublist_area.append(sublist_summ);
            sublist_area.append(sublist_button_div);
            sublist_area.append(sublist_div);

            // Setup the sublist buttons
            let add_sublist = $( '<input type="button" value="Add Sublist">' )
                .click(function() {
                    let content = sublist_dialog_content();
                    let add_entry_btn = $( '<input type="button" value="Add Entry">' )
                        .click(function() {
                            let new_entry = {
                                "name": $( "#pop_addname" ).val(),
                                "image": $( "#pop_imageurl" ).val(),
                                "type": "sublist",
                                "entries": [],
                            }

                            entry.entries.push(new_entry);

                            // use the api call to store the new version of the list
                            channellist.put_channel_list_to_server();
                            // re-draw the list
                            channellist.draw_channel_list();

                            close_popup();
                        });
                    let cancel_btn = $( '<input type="button" value="Cancel">' )
                        .click(function() {
                            close_popup();
                        });
                    content.append(add_entry_btn);
                    content.append(cancel_btn);
                    display_popup(content);
                });
            let add_media = $( '<input type="button" value="Add Media">' )
                .click(function() {
                    let content = media_dialog_content();
                    let add_entry_btn = $( '<input type="button" value="Add Entry">' )
                        .click(function() {
                            let new_entry = {
                                "name": $( "#pop_addname" ).val(),
                                "image": $( "#pop_imageurl" ).val(),
                                "videourl": $( "#pop_videourl" ).val(),
                                "videotype": $( 'input[name="pop_videnctype"]:checked' ).val(),
                                "loop": $( "#pop_loopmedia" ).prop("checked"),
                                "type": "video",
                            }

                            entry.entries.push(new_entry);

                            // use the api call to store the new version of the list
                            channellist.put_channel_list_to_server();
                            // re-draw the list
                            channellist.draw_channel_list();

                            close_popup();
                        });
                    let cancel_btn = $( '<input type="button" value="Cancel">' )
                        .click(function() {
                            close_popup();
                            debug_log("Clicked cancel");
                            return false;
                        });
                    content.append(add_entry_btn);
                    content.append(cancel_btn);
                    display_popup(content);
                });
            let mod_sublist = $( '<input type="button" value="Modify Sublist">' )
                .click(function() {
                    let content = sublist_dialog_content(entry);
                    let mod_entry_btn = $( '<input type="button" value="Modify Entry">' )
                        .click(function() {
                            entry.name = $( "#pop_addname" ).val();
                            entry.image = $( "#pop_imageurl" ).val();

                            // use the api call to store the new version of the list
                            channellist.put_channel_list_to_server();
                            // re-draw the list
                            channellist.draw_channel_list();

                            close_popup();
                        });
                    let cancel_btn = $( '<input type="button" value="Cancel">' )
                        .click(function() {
                            close_popup();
                        });
                    content.append(mod_entry_btn);
                    content.append(cancel_btn);
                    display_popup(content);
                });
            let del_sublist = $( '<input type="button" value="Delete Sublist">' )
                .click(function() {
                    let content = $( "<div><p>Confirm deletion</p></div>" );
                    let del_entry_btn = $( '<input type="button" value="Delete Sublist">' )
                        .click(function() {
                            ent_par.entries.splice(ent_par_ind, 1);

                            // use the api call to store the new version of the list
                            channellist.put_channel_list_to_server();
                            // re-draw the list
                            channellist.draw_channel_list();

                            close_popup();
                        });
                    let cancel_btn = $( '<input type="button" value="Cancel">' )
                        .click(function() {
                            close_popup();
                        });
                    content.append(del_entry_btn);
                    content.append(cancel_btn);
                    display_popup(content);
                });
            sublist_button_div.append(add_sublist);
            sublist_button_div.append(add_media);

            if( ent_par !== undefined ) {
                sublist_button_div.append(mod_sublist);
                sublist_button_div.append(del_sublist);
            }

            // Setup the sublist entries
            entry.entries.forEach(function (subentry, ind) {
                recursive_render(subentry, entry, ind, sublist_div);
            });

            // TODO - display more
            ent_disp.append(sublist_area);
        } else if( entry.type = "video" ) {
            ent_disp.append( $("<div></div>").text(entry.name));
            let video_area = $("<details></details>")
                .on('toggle', function(ev) {
                    entry.expanded = ev.target.open;
                });
            if( entry.expanded == true ) {
                video_area[0].open = true;
            } else {
                video_area[0].open = false;
            }
            let video_div = $('<div></div>');
            let video_summ = $("<summary>Media Details:</summary>");
            let video_button_div = $('<div></div>');

            let mod_media = $( '<input type="button" value="Modify Media">' )
                .click(function() {
                    let content = media_dialog_content(entry);
                    let mod_entry_btn = $( '<input type="button" value="Modify Entry">' )
                        .click(function() {
                            entry.name = $( "#pop_addname" ).val();
                            entry.image = $( "#pop_imageurl" ).val();
                            entry.videourl = $( "#pop_videourl" ).val();
                            entry.videotype = $( 'input[name="pop_videnctype"]:checked' ).val();
                            entry.loop = $( "#pop_loopmedia" ).prop("checked");

                            // use the api call to store the new version of the list
                            channellist.put_channel_list_to_server();
                            // re-draw the list
                            channellist.draw_channel_list();

                            close_popup();
                        });
                    let cancel_btn = $( '<input type="button" value="Cancel">' )
                        .click(function() {
                            close_popup();
                        });
                    content.append(mod_entry_btn);
                    content.append(cancel_btn);
                    display_popup(content);
                });
            let del_media = $( '<input type="button" value="Delete Media">' )
                .click(function() {
                    let content = $( "<div><p>Confirm deletion</p></div>" );
                    let del_entry_btn = $( '<input type="button" value="Delete Media">' )
                        .click(function() {
                            ent_par.entries.splice(ent_par_ind, 1);

                            // use the api call to store the new version of the list
                            channellist.put_channel_list_to_server();
                            // re-draw the list
                            channellist.draw_channel_list();

                            close_popup();
                        });
                    let cancel_btn = $( '<input type="button" value="Cancel">' )
                        .click(function() {
                            close_popup();
                        });
                    content.append(del_entry_btn);
                    content.append(cancel_btn);
                    display_popup(content);
                });
            video_button_div.append(mod_media);
            video_button_div.append(del_media);

            video_area.append(video_summ);
            video_area.append(video_button_div);
            video_area.append(video_div);
            // TODO - display mor
            ent_disp.append(video_area);
        }
        cur_disp_pos.append(ent_disp);
        return ent_disp.get()[0];
    };

    let top_level_elem = recursive_render(this.channel_list, undefined, undefined, channel_edit_list);
    this.set_selection(this.channel_list, top_level_elem); 

    channellist.channel_list_edit_area.children().detach();
    channellist.channel_list_edit_area.append(channel_edit_list);
}

ChannelList.prototype.set_selection = function (entry, domelem) {
    this.currently_selected = entry;
    $(".selected").removeClass("selected");
    domelem.classList.add("selected");

    $('input[name="thingtype"][value="' + entry.type + '"]').prop("checked", true);
    $('input[name="videnctype"][value="' + entry.videotype + '"]').prop("checked", true);
    $("#medianame").val(entry.name);
    $("#imageurl").val(entry.image);
    $("#mediaurl").val(entry.videourl);
    $("#loopmedia").prop("checked", (entry.loop === undefined) ? false : entry.loop);
}

ChannelList.prototype.change_vals = function(name, imgurl, vidurl, videnctype, loop) {
    let entry = {};
    if( this.currently_selected.type == "sublist" ) {
        this.currently_selected.name = name;
        this.currently_selected.image = imgurl;
    } else if( this.currently_selected.type == "video" ) {
        this.currently_selected.name = name;
        this.currently_selected.image = imgurl;
        this.currently_selected.videourl = vidurl;
        this.currently_selected.videotype = videnctype;
        this.currently_selected.loop = loop;
    }
    return true;
}

ChannelList.prototype.add_sublist = function (sublist_name, imgurl) {
    if( this.currently_selected.type != "sublist" ) {
        console.error("Cannot add entries to non-sublists");
        return false;
    }
    let entry = {
        "name": sublist_name,
        "image": imgurl,
        "type": "sublist",
        "entries": [],
    };
    this.currently_selected.entries.push(entry);

    return true;
}

ChannelList.prototype.add_video = function (video_name, imgurl, vidurl, videnctype) {
    if( this.currently_selected.type != "sublist" ) {
        console.error("Cannot add entries to non-sublists");
        return false;
    }
    let entry = {
        "name": video_name,
        "image": imgurl,
        "type": "video",
        "videourl": vidurl,
        "videotype": videnctype,
    };
    this.currently_selected.entries.push(entry);

    return true;
}

function validate_sess_to_main_or_login() {
    debug_log("validate_sess_to_main_or_login");
    make_api_request("validate_session_fe", {"method": "GET"},
        false,
        function() {
            debug_log("validation successful -> MainScreen");
            if( get_subpage() != "" ) {
                window.history.pushState("", "", "/");
            }
            let main_screen = new MainScreen();
            main_screen.draw();
        },
        function() {
            debug_log("validation fail -> LoginScreen");
            if( get_subpage() != "" ) {
                window.history.pushState("", "", "/");
            }
            let login_screen = new LoginScreen();
            login_screen.draw();
        }
    );
}

function get_subpage() {
    const urlParams = new URLSearchParams(window.location.search);
    if( urlParams.get("val_code") !== null ) {
        return "validation";
    } else if( urlParams.get("signup") !== null ) {
        return "signup";
    }
    return "";
}

function display_popup(content, after_close = function(){}) {
    let screen_props = window.SCREEN_PROPS;

    screen_props.pops_back.removeClass("notdisplayed");
    let close_pop = function(ev) {
        if( screen_props.pops_back.toArray().includes(ev.target) ||
                ev.target.classList.toString().includes("close_button") ) {
            debug_log("Clicked x or off");
            close_popup(after_close);
            return false;
        }
        return true;
    }

    screen_props.pops_back.off( "click" );
    screen_props.pops_back.click( close_pop );
    screen_props.pops_back.find(".close_button").off( "click" );
    screen_props.pops_back.find(".close_button").click( close_pop );

    screen_props.pops_area.empty();
    screen_props.pops_area.append(content);
}

function close_popup(after_close = function(){}) {
    window.SCREEN_PROPS.pops_back.addClass("notdisplayed");
    after_close();
}

function disp_spinner() {
    window.SCREEN_PROPS.spin_back.removeClass("notdisplayed");
}

function hide_spinner() {
    window.SCREEN_PROPS.spin_back.addClass("notdisplayed");
}

function disp_demo(demo_id) {
    let screen_props = window.SCREEN_PROPS;
    screen_props.demo_area.removeClass("notdisplayed");
    $(demo_id).removeClass("notdisplayed");
    screen_props.demo_area.off( "click" );
    screen_props.demo_area.click(function(ev) {
        if( screen_props.demo_area.toArray().includes(ev.target) ) {
            hide_demo(demo_id);
            return false;
        }
        return true;
    });
}

function hide_demo(demo_id) {
    window.SCREEN_PROPS.demo_area.addClass("notdisplayed");
    $(demo_id).addClass("notdisplayed");
}

function make_api_request(urlpart, api_props, show_spinner,
    done_func, fail_func)
{
    debug_log("make_api_request", arguments);
    let surround = function (inner_func) {
        return function() {
            hide_spinner();
            inner_func.apply(null, arguments);
        };
    };
    let actual_done = show_spinner ? surround(done_func) : done_func;
    let actual_fail = show_spinner ? surround(fail_func) : fail_func;

    if( show_spinner ) {
        disp_spinner();
    }

    api_props.crossDomain = true;
    api_props.xhrFields = { "withCredentials": true };

    $.ajax( get_api_url(urlpart), api_props )
        .done(actual_done)
        .fail(actual_fail);
}

function get_api_url(tail) {
    let API_ROOT = "https://api.runningstream.cc/api/v1/";
    if( document.location.host.includes("192.168.86.11") ) {
        //const API_ROOT = "http://localhost:3031/api/v1/";
        API_ROOT = "http://192.168.86.11:3031/api/v1/";
    }

    return API_ROOT + tail;
}

function debug_log() {
    if( window.DEBUG_OUTPUT === true ) {
        console.log.apply(null, arguments);
    }
}
