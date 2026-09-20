table! {
    channel_list (id) {
        id -> Int4,
        userid -> Int4,
        name -> Varchar,
        data -> Varchar,
    }
}

table! {
    front_end_sess_keys (id) {
        id -> Int4,
        userid -> Int4,
        sesskey -> Varchar,
        creationtime -> Timestamptz,
        lastusedtime -> Timestamptz,
    }
}

table! {
    library (id) {
        id -> Int4,
        name -> Varchar,
        owner_user_id -> Nullable<Int4>,
        is_global -> Bool,
    }
}

table! {
    library_entry (id) {
        id -> Int4,
        library_id -> Int4,
        name -> Varchar,
        url -> Text,
        thumbnail_url -> Nullable<Text>,
        media_type -> Varchar,
    }
}

table! {
    roku_sess_keys (id) {
        id -> Int4,
        userid -> Int4,
        sesskey -> Varchar,
        creationtime -> Timestamptz,
        lastusedtime -> Timestamptz,
    }
}

table! {
    display_sess_keys (id) {
        id -> Int4,
        userid -> Int4,
        sesskey -> Varchar,
        creationtime -> Timestamptz,
        lastusedtime -> Timestamptz,
    }
}

table! {
    user_data (id) {
        id -> Int4,
        username -> Varchar,
        pass_hash -> Varchar,
        pass_hash_type -> Int4,
        validation_status -> Bool,
        validation_code -> Nullable<Varchar>,
        active_channel -> Nullable<Int4>,
    }
}

joinable!(front_end_sess_keys -> user_data (userid));
joinable!(library -> user_data (owner_user_id));
joinable!(library_entry -> library (library_id));
joinable!(roku_sess_keys -> user_data (userid));
joinable!(display_sess_keys -> user_data (userid));
joinable!(user_data -> channel_list (active_channel));

allow_tables_to_appear_in_same_query!(
    channel_list,
    front_end_sess_keys,
    library,
    library_entry,
    roku_sess_keys,
    display_sess_keys,
    user_data,
);
