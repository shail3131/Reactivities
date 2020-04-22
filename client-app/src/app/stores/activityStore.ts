import { createContext,SyntheticEvent } from 'react';
import { observable,action,computed,configure,runInAction} from 'mobx';
import agent from '../api/agent';
import { IActivity } from '../models/activity';

configure({enforceActions: 'always'});

class ActivityStore{

  // Load Activities 
    @observable activityRegistry = new Map();  
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

     // fetch a individual Activity 
    @action loadActivity = async (id:string) => {
       let activity = this.getActivity(id);
       if(activity){
           this.activity = activity;
       }else{
           this.loadingInitial = true;
           try{

               activity = agent.Activities.details(id);
               runInAction('getting Activity',()=>{
                 this.activity=activity;
                 this.loadingInitial = false;
               })

           }catch(error){
               console.log(error);
               runInAction('getting Activity error',()=>{
                  this.loadingInitial = false;
               })
               
           }
       }
    }


    @action clearActivity = ()=>
    {
         this.activity=null;
    }

    getActivity = (id:string) =>{
        return this.activityRegistry.get(id);
    }

     // View Activity
     @observable activity: IActivity | null=null;     

     @action selectActivity = (id:string) => {
         this.activity = this.activityRegistry.get(id);         
     }


     //Create Activity 

     @observable submitting=false;
     @action createActivity = async (activity : IActivity) =>{
         this.submitting =true;
                
         try{
              await agent.Activities.create(activity);
              runInAction('create Activity',() =>{
                  this.activityRegistry.set(activity.id,activity);                     
                  this.submitting=false;
              })
              

         }catch(error){
           console.log(error);
            runInAction('create Activity error',()=> {
              this.submitting = false;
            })
           
         }
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
             this.activity = activity;            
             this.submitting = false;
           })
           

        }catch(error){
            runInAction('edit Activity error',() =>{
                this.submitting = false;
            })
           
            console.log(error);
        }

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