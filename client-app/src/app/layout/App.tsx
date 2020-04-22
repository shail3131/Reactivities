import React, { Fragment } from 'react';
import {Route,withRouter} from 'react-router-dom';
import {RouteComponentProps} from 'react-router'
import {observer} from 'mobx-react-lite';
import { Container } from 'semantic-ui-react';
import NavBar from '../../features/nav/NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetails';
import HomePage from '../../features/home/HomePage';




const App:React.FC<RouteComponentProps> = ({location}) => {

  

  return (
    <Fragment>
    <Route exact path='/' component= {HomePage}/>
    <Route path={'/(.+)'}
     render ={() =>(
   <Fragment>
     <NavBar  />
      <Container style={{ marginTop: '7em' }}>
      
      <Route exact path='/activities' component= {ActivityDashboard}/>
      <Route path='/activities/:id' component= {ActivityDetails}/>
      <Route key={location.key} path= {['/createActivity','/manage/:id']} component= {ActivityForm}/>
      
        
      </Container>
   </Fragment>
     
    )}/>
      
    </Fragment>
  );
};

export default withRouter(observer(App));
