const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    puid:{type:String,required:true, unique:true},
    name:{type:String, minlength:3,required:true},
    content:{type:String, default:""},
    viewForAll:{type:Boolean, default:true}, 
    editForAll:{type:Boolean, default:true},
    canView:{type:[String], default:[]},  /** email list who can view  */
    canEdit:{type:[String], default:[]},  /** email list who can edit */
    owner:{type:String}, 
    /** if no owner, 
     *         -> will be removed in 3 hours (not implemented)
     *         -> anyone can view/edit
     * login owner can set: who can view (all, none, or invited ones), who can edit(all, none, or invited ones) */
    
    created:{type:Date, default: Date.now},
    updated:{type:Date}
});

pageSchema.statics.get = (puid) =>{
    return new Promise((resolve, reject)=>{
        self.findOne({puid:puid}, (err, page) =>{
            if(err) return reject(err);
            return resolve(page);
        });
    })
}

pageSchema.static.claim = (userId, name, puid) => {
    return new Promise((resolve, reject)=>{
        self.findOne({puid:puid, name:name}, (err, page) =>{
            if(err) return reject(err);

            if(!page.owner){
                page.owner = userId;
                page.save((err, _page) =>{
                    if(err) return reject(err);
                    else return resolve(_page);
                })
            }else{
                return reject("Failed to claim ownership");
            }
        });
    })
}

pageSchema.statics.create = (pageInstance) =>{

    return new Promise((resolve, reject)=>{
        pageInstance.save((err, page) =>{
            if(err) { 
                console.log('err in creation')

                console.log(err)
                reject(err);
            }else{
                console.log('ok created')
                resolve(page);
            }
        });
    })
}

pageSchema.statics.doSave = (puid, name, content) =>{
    return new Promise((resolve, reject)=>{
        console.log('to save')
        console.log(puid)
        console.log(name)

        console.log(content)
        self.findOneAndUpdate({puid:puid}, {$set:{content:content, name:name}},{new: true}, (err, page) =>{
            if(err) return reject(err);
            console.log('saved..')
            console.log(page)
            resolve(page);
        });
    })
}

pageSchema.statics.doSaveById = (_id, content) =>{
    return new Promise((resolve, reject)=>{
        console.log(_id)
        console.log(content)
        
        self.findOneAndUpdate({_id:_id},  {$set:{content:content}}, {new: true}, (err, page) =>{
            if(err) return reject(err);
            return resolve(page);
        });
    })
}


const self = module.exports = mongoose.model("pages", pageSchema);
