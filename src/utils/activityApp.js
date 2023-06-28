import { CrudLocalbase } from "./localbase"
export class activity {
    activityDb = new CrudLocalbase('activity');
    
    addActivity() {
        this.activityDb.writeData()
    }
}