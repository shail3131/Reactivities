import { createContext,SyntheticEvent } from 'react';
import { observable,action,computed,configure,runInAction} from 'mobx';
import agent from '../api/agent';
import { IActivity } from '../models/activity';

configure({enforceActions: 'always'});

class ActivityStore{


    @observable activityRegistry = new Map();
    // Load Activities 
     @observable activities: IActivity[] = [];
     @observable loadingInitial = false;

     @action loadActivities = async () => {
         this.loadingInitial = true;

         try{
          const activities = await agent.Activities.list()

          runInAction('loading activities',() =>{
             activities.forEach((activity) => {
          activity.date = activity.date.split('.')[0]        
          this.activityRegistry.set(activity.id,activity)
        });     
          this.loadingInitial=false;
            
          })
         
         }catch(error){
             console.log(error);
             runInAction('load activity error',() => {
               this.loadingInitial=false;
             })
             
         }        
         
     }

     // View Activity
     @observable selectedActivity: IActivity | undefined;
     @observable editMode = false;

     @action selectActivity = (id:string) => {
         this.selectedActivity = this.activityRegistry.get(id);
         this.editMode=false;
     }

     //Create Activity 

     @observable submitting=false;
     @action createActivity = async (activity : IActivity) =>{
         this.submitting =true;
                
         try{
              await agent.Activities.create(activity);
              runInAction('create Activity',() =>{
                  this.activityRegistry.set(activity.id,activity);        
                  this.editMode=false;
                  this.submitting=false;
              })
              

         }catch(error){
           console.log(error);
            runInAction('create Activity error',()=> {
              this.submitting = false;
            })
           
         }
     }

     //open form
     @action openCreateForm = ()=>{
         this.editMode=true;
         this.selectedActivity=undefined;
     }

    //  Computed based on date order by date

    @computed get activitiesByDate() {
        return Array.from(this.activityRegistry.values())
        .sort((a,b) => Date.parse(a.date)- Date.parse(b.date)
        );
    }

    // Edit a Activity

    @action editActivity = async (activity : IActivity) => {
        this.submitting = true;
        try{
           await  agent.Activities.update(activity);
           runInAction('edit Activity',() =>{
             this.activityRegistry.set(activity.id,activity);
             this.selectedActivity = activity;
             this.editMode = false;
             this.submitting = false;
           })
           

        }catch(error){
            runInAction('edit Activity error',() =>{
                this.submitting = false;
            })
           
            console.log(error);
        }

    }

    @action openEditForm = (id:string) => {
        this.selectedActivity = this.activityRegistry.get(id);
        this.editMode = true;

    }

    @action cancelSelectedActivity = () => {
        this.selectedActivity  = undefined;
    }

    @action cancelFormOpen = () =>{
        this.editMode = false;
    }

    // delete a activity

    @observable target = '';

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>,id: string) => {
          this.submitting =true;

          this.target = event.currentTarget.name;

          try{
               await agent.Activities.delete(id)

               runInAction('delete Activity',()=>{
                  this.activityRegistry.delete(id);
                  this.submitting = false;
                  this.target='';
               })
               
              
          }catch(error){

              runInAction('delete Activity error',()=>{
                 this.submitting = false;
                 this.target='';
              })
              
              console.log(error);
          }
         
          
    }

}

export default createContext(new ActivityStore())