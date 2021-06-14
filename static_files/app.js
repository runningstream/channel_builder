$(document).ready(main);

function main() {
    const HEAD_AREA = $("#header_area");
    const SCREEN_AREA = $("#screen_area");
    const FOOT_AREA = $("#footer_area");

    // See if this is a registration request
    const urlParams = new URLSearchParams(window.location.search);
    const val_code = urlParams.get("val_code");
    if( val_code !== null ) {
        let val_screen = new ValidationScreen();
        val_screen.draw(HEAD_AREA, SCREEN_AREA, FOOT_AREA);
        return;
    }

    // Determine if we already have a valid session id, and if so jump to the main screen
    $.ajax( "/api/v1/validate_session_fe", {
        "method": "GET",
    }).done( function() {
        // Display the main screen
        let main_screen = new MainScreen();
        main_screen.draw(HEAD_AREA, SCREEN_AREA, FOOT_AREA);
    }).fail( function() {
        // Display the login screen
        let login_screen = new LoginScreen();
        login_screen.draw(HEAD_AREA, SCREEN_AREA, FOOT_AREA);
    });
}

function UIScreen() {
    
}

UIScreen.prototype.draw = function (head_area, draw_area, foot_area) {
    let content = $("You drew the parent UIScreen - you should never see this.");
    head_area.empty();
    foot_area.empty();
    draw_area.empty();
    draw_area.append(content);
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

LoginScreen.prototype.draw = function (head_area, draw_area, foot_area) {
    let content = $( '<form>' +
        '<label for="login_username">Username:</label>' +
        '<input type="text" id="login_username" autocomplete="username">' +
        '<label for="login_password">Password:</label>' +
        '<input type="password" id="login_password" autocomplete="current-password">' +
        '</form>' );
    let login_button = $( '<input type="button" value="Login">' )
        .click(function() { 
            let login_dat = {
                "username": $("#login_username").val(),
                "password": $("#login_password").val(),
            };
            $.ajax( "/api/v1/authenticate_fe", {
                "method": "POST",
                "data": login_dat,
            }).done(function() {
                // TODO determine if we now have a session id, and if so, jump to the next part, otherwise display failure
                let main_screen = new MainScreen();
                main_screen.draw(head_area, draw_area, foot_area);
            }).fail(function() {
                // TODO determine reason for failure and take action
            });
        });
    let register_button = $( '<input type="button" value="Register">' )
        .click(function() {
            let reg_screen = new RegisterScreen();
            reg_screen.draw(head_area, draw_area, foot_area);
        });

    content.append(login_button);
    content.append(register_button);

    head_area.empty();
    foot_area.empty();
    draw_area.empty();
    draw_area.append(content);
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

RegisterScreen.prototype.draw = function (head_area, draw_area, foot_area) {
    let content = $( '<form>' +
        '<label for="reg_username">Email Address:</label>' +
        '<input type="text" id="reg_username" autocomplete="username">' +
        '<label for="reg_password">Password:</label>' +
        '<input type="password" id="reg_password" autocomplete="current-password">' +
        '<label for="verify_password">Verify Password:</label>' +
        '<input type="password" id="verify_password" autocomplete="current-password">' +
        '</form>'
    );
    let login_button = $( '<input type="button" value="Register">' )
        .click(function() { 
            if( $("#reg_password").val() != $("#verify_password").val() ) {
                // TODO make this nicer
                alert("Passwords do not match!");
                return;
            }
            let reg_dat = {
                "username": $("#reg_username").val(),
                "password": $("#reg_password").val(),
            };
            $.ajax( "/api/v1/create_account", {
                "method": "POST",
                "data": reg_dat,
            }).done(function() {
                // TODO determine whether it was successful and display a message
                alert("User account requested, look for an email...");
                let login_screen = new LoginScreen();
                login_screen.draw(head_area, draw_area, foot_area);
            }).fail(function() {
                // TODO determine reason for failure and take action
            });
        });
    content.append(login_button);

    head_area.empty();
    foot_area.empty();
    draw_area.empty();
    draw_area.append(content);
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

ValidationScreen.prototype.draw = function (head_area, draw_area, foot_area) {
    let content = $( '<form>' +
        '</form>'
    );
    let validate_button = $( '<input type="button" value="Validate Account">' )
        .click(function() {
            const urlParams = new URLSearchParams(window.location.search);
            const val_code = urlParams.get("val_code");
            
            $.ajax( "/api/v1/validate_account?val_code="+val_code, {
                "method": "GET",
            }).done( function() {
                // TODO determine whether it was successful and display a message
                alert("User validation successful!  Now login."); 
                window.history.pushState("Account Validation", "Account Validation", "/");
                let login_screen = new LoginScreen();
                login_screen.draw(head_area, draw_area, foot_area);
            }).fail( function(jqXHR, textStatus, errorThrown) {
                // TODO test the part below, perhaps display in a nicer way
                if( jqXHR.status == 403 ) {
                    alert("Invalid validation code.");
                } else {
                    alert("Validation failed.");
                }
                window.history.pushState("Main Screen", "Main Screen", "/");
                let login_screen = new LoginScreen();
                login_screen.draw(head_area, draw_area, foot_area);
            });
        });

    content.append(validate_button);

    head_area.empty();
    foot_area.empty();
    draw_area.empty();
    draw_area.append(content);
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

MainScreen.prototype.draw = function (head_area, draw_area, foot_area) {
    let content = $( '<div id="content"></div>' );
    let mgmt_button_area = $( "<div></div>" );
    let channel_list_area = $( '<div id="chan_list"></div>' );
    let channel_edit_area = $( '<div id="chan_edit"></div>' );

    let channel_list_list = new ChannelListList(channel_edit_area, foot_area);
    channel_list_list.draw(channel_list_area);

    let validate_button = $( '<input type="button" value="Validate Session">' )
        .click(function() {
            $.ajax( "/api/v1/validate_session_fe", {
                "method": "GET",
            }).done( function() {
                alert("Session validation successful."); 
            }).fail( function() {
                alert("Fail");
            });
        });

    let logout_button = $( '<input type="button" value="Logout">' )
        .click(function() {
            $.ajax( "/api/v1/logout_session_fe", {
                "method": "GET",
            }).done( function() {
                let login_screen = new LoginScreen();
                login_screen.draw(head_area, draw_area, foot_area);
            }).fail( function() {
                validate_session_or_login_screen(head_area, draw_area, foot_area);
            });
        });

    mgmt_button_area.append(validate_button);
    mgmt_button_area.append(logout_button);

    content.append(channel_list_area);
    content.append(channel_edit_area);

    head_area.empty();
    foot_area.empty();
    draw_area.empty();
    head_area.append(mgmt_button_area);
    draw_area.append(content);
}

function ChannelListList(channel_list_edit_area, chan_list_edit_button_dest) {
    this.channel_list_list_area = $( "<div></div>" );
    this.channel_list_edit_area = channel_list_edit_area;
    this.channel_list_edit_button_dest = chan_list_edit_button_dest;
    this.channel_list_list = [];
    this.selected_list = null;

    this.get_channel_lists_from_server();
}

ChannelListList.prototype.get_channel_lists_from_server = function () {
    let channellistlist = this;
    $.ajax( "/api/v1/get_channel_lists", {
        "method": "GET",
    }).done( function(data_str) {
        channellistlist.channel_list_list = JSON.parse(data_str);
        channellistlist.draw_channel_list_list();
    }).fail( function() {
        // TODO improve
        alert("Getting channel lists failed, please refresh");
    });
}

ChannelListList.prototype.draw = function (draw_area) {
    console.log("qwer");
    draw_area.children().detach();
    draw_area.append(this.channel_list_list_area);
}

ChannelListList.prototype.draw_channel_list_list = function () {
    let channel_list_list = this;

    let channel_list = $( '<div></div>' );

    let new_channel_list_area = $( "<form>" +
        '<label for="new_channel_list_name">New Channel List Name:</label>' +
        '<input type="textarea" id="new_channel_list_name">' +
        "</form>" );


    let create_channel_list_button = 
        $( '<input type="button" value="Create Channel List">' )
        .click(function() {
            let data = {
                "listname": $("#new_channel_list_name").val(),
            };
            channel_list_list.channel_list_list.push(data["listname"]);
            $.ajax( "/api/v1/create_channel_list", {
                "method": "POST",
                "data": data,
            }).done( function() {
                alert("Channel list created."); 
            }).fail( function() {
                alert("Fail");
            });
            channel_list_list.draw_channel_list_list();
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
            console.log(data);
            $.ajax( "/api/v1/set_active_channel", {
                "method": "POST",
                "data": data,
            }).done( function() {
                alert("Active channel set."); 
            }).fail( function() {
                alert("Fail");
            });
        });
    new_channel_list_area.append(set_active_channel_list_button);

    let chan_edit_butt_dest = this.channel_list_edit_button_dest;

    this.channel_list_list.forEach(function (channel_name) {
        let channel = $( '<div class="sel_list_ent"></div>' ).text(channel_name);
        let channellist = new ChannelList(channel_name, chan_edit_butt_dest);
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

function ChannelList(channel_name, chan_edit_butt_dest) {
    this.channel_name = channel_name;
    this.channel_list_button_dest = chan_edit_butt_dest;
    this.channel_list_edit_area = $("<div></div>");
    this.channel_list_button_area = $("<div></div>");
    this.channel_list = {"entries": []};
    this.currently_selected = null;
    this.add_entry_button = null;
    this.change_entry_button = null;

    this.get_channel_list_from_server();
}

ChannelList.prototype.draw = function (draw_area) {
    draw_area.children().detach();
    draw_area.append(this.channel_list_edit_area);
    this.channel_list_button_dest.children().detach();
    this.channel_list_button_dest.append(this.channel_list_button_area);
}

ChannelList.prototype.get_channel_list_from_server = function () {
    let channellist = this;
    $.ajax( "/api/v1/get_channel_list?list_name="+this.channel_name, {
        "method": "GET",
    }).done( function(data_str) {
        channellist.channel_list = JSON.parse(data_str);
        channellist.draw_channel_list();
    }).fail( function() {
        // TODO improve
        alert("Getting channel list failed, please refresh");
    });
}

ChannelList.prototype.put_channel_list_to_server = function() {
    let channellist = this;
    let list_dat = {
        "listname": this.channel_name,
        "listdata": JSON.stringify(this.channel_list),
    };
    $.ajax( "/api/v1/set_channel_list", {
        "method": "POST",
        "data": list_dat,
    }).done( function(data_str) {
        console.log("Successful update");
    }).fail( function() {
        // TODO improve
        alert("Updating channel list failed, please refresh");
    });
}


ChannelList.prototype.draw_channel_list = function() {
    let channellist = this;
    channellist.channel_list.type="sublist";
    channellist.channel_list.name=channellist.channel_name;
    let channel_edit_buttons = $( "<div></div>" );
    let channel_edit_list = $( '<div></div>' );

    let new_name = $('<input type="textarea">');
    let new_name_label = $('<label>Name: </label>');
    new_name_label.append(new_name);

    let new_imgurl = $('<input type="textarea">');
    let new_imgurl_label = $('<label>Image URL: </label>');
    new_imgurl_label.append(new_imgurl);

    let new_vidurl = $('<input type="textarea">');
    let new_vidurl_label = $('<label>Video URL: </label>');
    new_vidurl_label.append(new_vidurl);

    let new_typesub = $('<input type="radio" value="sublist" name="thingtype">');
    let new_typesub_label = $('<label>Sublist</label>');
    new_typesub_label.append(new_typesub);
    let new_typevid = $('<input type="radio" value="video" name="thingtype"checked="true">');
    let new_typevid_label = $('<label>video</label>');
    new_typevid_label.append(new_typevid);

    let new_videnc_mp4 = $('<input type="radio" value="mp4" name="videnctype" checked="true">');
    let new_videnc_mp4_label = $('<label>MP4</label>');
    new_videnc_mp4_label.append(new_videnc_mp4);


    this.add_entry_button = $( '<input type="button" value="Add Entry">' )
        .click(function() {
            // Get radio button value
            const typeset = $('input[name="thingtype"]:checked').val();
            const videnctype = $('input[name="videnctype"]:checked').val();
            let result = false;
            if( typeset == "sublist" ) {
                // create the sublist and add it to the common data store of the list
                result = channellist.add_sublist(new_name.val(), new_imgurl.val());
            } else {
                // create the video and add it to the common data store of the list
                result = channellist.add_video(new_name.val(), new_imgurl.val(), new_vidurl.val(), videnctype);
            }
            if( result ) {
                // use the api call to store the new version of the list
                channellist.put_channel_list_to_server();
                // re-draw the list
                channellist.draw_channel_list();
            }
        });
    this.change_entry_button = $( '<input type="button" value="Change Entry">' )
        .click(function() {
            // Get radio button value
            const videnctype = $('input[name="videnctype"]:checked').val();

            const result = channellist.change_vals(new_name.val(), new_imgurl.val(), new_vidurl.val(), videnctype);
            if( result ) {
                // use the api call to store the new version of the list
                channellist.put_channel_list_to_server();
                // re-draw the list
                channellist.draw_channel_list();
            }
        });

    channel_edit_buttons.append(new_typesub_label);
    channel_edit_buttons.append(new_typevid_label);
    channel_edit_buttons.append(new_name_label);
    channel_edit_buttons.append(new_imgurl_label);
    channel_edit_buttons.append(new_vidurl_label);
    channel_edit_buttons.append(new_videnc_mp4_label);
    channel_edit_buttons.append(this.add_entry_button);
    channel_edit_buttons.append(this.change_entry_button);

    let recursive_render = function(entry, cur_disp_pos) {
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
            let sublist_area = $('<details></details>');
            let sublist_summ = $("<summary>Sublist:</summary>");
            let sublist_div = $('<div></div>');
            sublist_area.append(sublist_summ);
            sublist_area.append(sublist_div);
            entry.entries.forEach(function (subentry) {
                recursive_render(subentry, sublist_div);
            });
            // TODO - display more
            ent_disp.append(sublist_area);
        } else if( entry.type = "video" ) {
            ent_disp.append( $("<div></div>").text(entry.name));
            let video_area = $("<details></details>");
            let video_div = $('<div></div>');
            let video_summ = $("<summary>Video Details:</summary>");
            video_area.append(video_summ);
            video_area.append(video_div);
            // TODO - display more
            ent_disp.append(video_area);
        }
        cur_disp_pos.append(ent_disp);
        return ent_disp.get()[0];
    };

    let top_level_elem = recursive_render(this.channel_list, channel_edit_list);
    this.set_selection(this.channel_list, top_level_elem); 

    channellist.channel_list_edit_area.children().detach();
    channellist.channel_list_edit_area.append(channel_edit_list);
    channellist.channel_list_button_area.children().detach();
    channellist.channel_list_button_area.append(channel_edit_buttons);
}

ChannelList.prototype.set_selection = function (entry, domelem) {
    console.log(entry, domelem);
    this.currently_selected = entry;
    $(".selected").removeClass("selected");
    domelem.classList.add("selected");

    if( entry.type == "sublist" ) {
        this.add_entry_button.removeClass("notdisplayed");
        this.change_entry_button.removeClass("notdisplayed");
    } else if( entry.type == "video" ) {
        this.add_entry_button.addClass("notdisplayed");
        this.change_entry_button.removeClass("notdisplayed");
    }
}

ChannelList.prototype.change_vals = function(name, imgurl, vidurl, videnctype) {
    let entry = {};
    if( this.currently_selected.type == "sublist" ) {
        this.currently_selected.name = name;
        this.currently_selected.image = imgurl;
    } else if( this.currently_selected.type == "video" ) {
        this.currently_selected.name = name;
        this.currently_selected.image = imgurl;
        this.currently_selected.videourl = vidurl;
        this.currently_selected.videotype = videnctype;
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

function validate_session_or_login_screen(head_area, draw_area, foot_area) {
    $.ajax( "/api/v1/validate_session_fe", {
        "method": "GET",
    }).done( function() {
        // Do nothing - we're still valid
    }).fail( function() {
        let login_screen = new LoginScreen();
        login_screen.draw(head_area, draw_area, foot_area);
    });
}
