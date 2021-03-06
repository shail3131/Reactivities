import React, { useState,useContext,useEffect } from 'react';
import {observer} from 'mobx-react-lite';
import { Segment, Form, Button,Grid } from 'semantic-ui-react';

import {combineValidators, isRequired, composeValidators, hasLengthGreaterThan} from 'revalidate'
import {  ActivityFormValues } from '../../../app/models/activity';
import {v4 as uuid} from 'uuid';
import {RouteComponentProps} from 'react-router'

import {Form as FinalForm,Field} from 'react-final-form'
import TextInput from '../../../app/common/form/TextInput';
import TextAreaInput from '../../../app/common/form/TextAreaInput';
import SelectInput from '../../../app/common/form/SelectInput';
import category from '../../../app/common/options/categoryOptions';
import DateInput from '../../../app/common/form/DateInput';
import { combineDateAndTime } from '../../../app/common/util/util';
import { RootStoreContext } from '../../../app/stores/rootStore';

const validate = combineValidators({
  title:isRequired({message:'The event title is required'}),
  category:isRequired({message:'The event Category is required'}),
  description:composeValidators(
     isRequired({message:'The event Description is required'}),
     hasLengthGreaterThan(4)({message:'The event Description needs to be atleast 5 characters'})
  )(),
  city:isRequired({message:'The event City is required'}),
  venue:isRequired({message:'The event Venue is required'}),
  date:isRequired({message:'The event Date is required'}),
  time:isRequired({message:'The event Time is required'})
})

interface DetailsParams{
  id:string
}

const ActivityForm: React.FC<RouteComponentProps<DetailsParams>> = ({match,history}) => {

  const rootStore = useContext(RootStoreContext);

  const {createActivity,editActivity,submitting,
  loadActivity} = rootStore.activityStore; 
  

  const [activity, setActivity] = useState(new ActivityFormValues());

  const [loading,setLoading] = useState(false);
    useEffect(() => {
    if(match.params.id ){
      setLoading(true);
       loadActivity(match.params.id)
       .then((activity)=> setActivity(new ActivityFormValues(activity))
       ).finally(() => setLoading(false));
    }  
      
  },[loadActivity,match.params.id]);


  const handleFinalFormSubmit = (values :any) =>{
    const dateAndTime= combineDateAndTime(values.date,values.time);
    const {date,time,...activity} = values;
    activity.date=dateAndTime;
    if (!activity.id) {
          let newActivity = {
            ...activity,
            id: uuid()
          };
          createActivity(newActivity);
          
        } else {
          editActivity(activity);
        }
  }

  

  return (

    <Grid>
       <Grid.Column width={10}>
          <Segment clearing >

            <FinalForm
             validate={validate}
            initialValues={activity}
             onSubmit = {handleFinalFormSubmit}

             render = {({handleSubmit,invalid,pristine}) =>(
             <Form onSubmit={handleSubmit} loading={loading}>
              <Field                
                name='title'
                placeholder='Title'
                value={activity.title}
                component = {TextInput}
              />
              <Field
                component = {TextAreaInput}
                name='description'
                rows={3}
                placeholder='Description'
                value={activity.description}
              />
              <Field
                component = {SelectInput}
                options={category}
                name='category'
                placeholder='Category'
                value={activity.category}
              />

              <Form.Group widths='equal'>
                <Field               
                  name='date'               
                  placeholder='Date'
                  date={true}
                  value={activity.date}
                  component = {DateInput}
                />

                <Field               
                  name='time'               
                  placeholder='Time'
                  time={true}
                  value={activity.time}
                  component = {DateInput}
                />
              </Form.Group>
              
              <Field
                component = {TextInput}
                name='city'
                placeholder='City'
                value={activity.city}
              />
              <Field
               component = {TextInput}
                name='venue'
                placeholder='Venue'
                value={activity.venue}
              />
              <Button 
              loading={submitting} 
              disabled ={loading || invalid || pristine} 
              floated='right' 
              positive type='submit' 
              content='Submit' />
              <Button
                onClick={ activity.id 
                  ? () => history.push(`/activities/${activity.id}`) 
                  : () => history.push('/activities')}
                floated='right'
                disabled ={loading}
                type='button'
                content='Cancel'
              />
            </Form>
             )}
            
            />

            
     
    </Segment>
       </Grid.Column>
    </Grid>
    
  );
};

export default observer(ActivityForm);
