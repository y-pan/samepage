
const pageModel = require('../models/page.model');


let emailCred = {};
let baseUrl = null;

if(process.env.IS_HEROKU_DEPLOYMENT){
    emailCred['user'] = process.env.eu;
    emailCred['pass'] = process.env.ep;
    baseUrl = "https://samepage1.herokuapp.com/";
}else{
    const cred = require('../config/secret.json');
    emailCred['user'] = cred.eu;
    emailCred['pass'] = cred.ep;
    baseUrl = "http://localhost:8000/";
}

// emailCred['user'] = process.env.eu;
// emailCred['pass'] = process.env.ep;
// baseUrl = "https://samepage1.herokuapp.com/";


const gSend = require('gmail-send')({
    user:emailCred['user'],
    pass:emailCred['pass']
})


const get = (req, res) => {  /** view  */
    // let name = req.query.name;
    let puid = req.query.puid; /** puid is from client, because I want to create socket connection for each page by puid */
    pageModel.get(puid).then(page =>{
        res.json({data:page})
    }).catch(err => {
        res.json({err:err});
    });
}


const getByUid = (req, res) => {  /** view  */
    // let name = req.query.name;
    let puid = req.params.puid; /** puid is from client, because I want to create socket connection for each page by puid */
    pageModel.get(puid).then(page =>{
        res.json({data:page})
    }).catch(err => {
        res.json({err:err});
    });
}

const create = (req, res) =>{
    let owner = req.body.owner || ""; /** user is _id */
    let puid = req.body.puid;
    let name = req.body.name; /** page name, set by user */
    let content = req.body.content || "";
    let pageInstance = new pageModel({puid:puid, name:name, owner:owner, content:content});
    console.log("to create for puid: " + puid);
    // console.log("incomming create req: ", pageInstance);
    pageModel.create(pageInstance).then(page =>{
        res.json({data:page});
    }).catch(err => {
        res.json({err:err});
    });
}


// const saveById = (req, res) =>{  /** save by _id */
//     let content = req.body.content;
//     let _id = req.body._id;
//     console.log('do save...')
//     pageModel.doSave(_id, content).then(page => {
//         res.json({data:page});
//     }).catch(err => { 
//         console.log('err: ', err);
//         res.json({err:err})});
    
// }


const save = (req, res) =>{  /** save by _id */
    let puid = req.body.puid;
    let name = req.body.name;
    let content = req.body.content;

    console.log('do save...')
    pageModel.doSave(puid, name, content).then(page => {
        res.json({data:page});
    }).catch(err => { 
        console.log('err: ', err);
        res.json({err:err})});
}

const share = (req, res) => {
    let puid = req.body.puid;
    // let url = `${baseUrl}${puid}`
    let url = baseUrl+puid;
    let emailJson = {}
    emailJson.from = req.body.from || "N/A";
    emailJson.to = req.body.emails; /* array of emails*/
    emailJson.subject = "Page shared with you on SamePage";
    emailJson.text = `A page is shared with you, created by ${emailJson.from}. You can open the link in your browser:\n${url}\n\nPlease do not reply this email, as it's not monitored by person.\n\nSamePage Admin`;
    console.log(emailJson)

    gSend(emailJson, (err, data)=>{
        if(err){
            res.json({err:err});
        }else{
            res.json({data:data})
        }
    })
}

module.exports = {
    'get':get,
    'getByUid':getByUid,
    'create':create,
    'save':save,
    'share':share
}