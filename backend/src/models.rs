use serde::{Deserialize, Serialize};

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct AuthForm {
    pub username: String,
    pub password: String,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct CreateAcctForm {
    pub username: String,
    pub password: String,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct SetChannelListForm {
    pub listname: String,
    pub listdata: String,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct RenameChannelForm {
    pub listname: String,
    pub newlistname: String,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct CreateChannelListForm {
    pub listname: String,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct SetActiveChannelForm {
    pub listname: String,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct DeleteChannelQuery {
    pub listname: String,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct GetChannelListQuery {
    pub list_name: String,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct ValidateAccountRequest {
    pub val_code: String,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct GetLibraryEntriesQuery {
    pub library_id: i32,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct AddLibraryEntryForm {
    pub library_id: i32,
    pub name: String,
    pub url: String,
    pub media_type: String,
    pub thumbnail_url: Option<String>,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct RemoveLibraryEntryQuery {
    pub entry_id: i32,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct CreateLibraryForm {
    pub name: String,
}

#[derive(Debug,Deserialize,Serialize,Clone)]
pub struct RemoveLibraryQuery {
    pub library_id: i32,
}
