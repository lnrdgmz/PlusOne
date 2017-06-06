// Import React and Redux Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Waypoint from 'react-waypoint';
import { filter } from 'lodash/collection';
import { escapeRegExp } from 'lodash/string';

// local dependencies
import { Container, Search, Grid, Divider, Modal } from 'semantic-ui-react';
import MenuBar from '../components/MenuBar';
import GridEvent from '../components/GridEvent';
import Event from '../components/Event';
import { fetchEvents } from '../actions/eventActions';
import { joinEvent } from '../actions/actions';
import '../../public/styles/events.scss';

class Events extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalFocus: false,
      page: 1,
    };

    this.handleElementClick = this.handleElementClick.bind(this);
    this.getEventCreator = this.getEventCreator.bind(this);
  }

  componentWillMount() {
    this.props.eventsList.forEach((event) => {
      fetch(`/events/${event.id}`, { credentials: 'include' })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          data.users.forEach((user) => {
            if (user.role === 'creator') {
              event.creator = user;
            }
          });
        });
    });
    this.resetComponent();
    console.log(this.props.eventsList); 
  }

  getMoreEvents = () => {
    this.setState({ page: this.state.page + 1});
    this.props.fetchEvents(this.state.page);
    console.log(this.state.page);
  }

  clearModalFocus = () => this.setState({ modalFocus: false, eventCreator: {} })
  getEventCreator = (event) => {
    
      console.log('eventCreator', this.state.eventCreator);
  }
  handleElementClick = (event) => {
    this.setState({ modalFocus: event });
    fetch(`/events/${event.id}`, { credentials: 'include' })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.users.forEach((user) => {
          if (user.role === 'creator') {
            this.setState({
              eventCreator: user,
            });
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  handleJoinEvent = (user, event) => this.props.joinEvent(user, event);

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' });

  handleResultSelect = (e, result) => this.setState({ value: result.description })

  handleSearchChange = (e, value) => {
    this.setState({ isLoading: true, value });

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent();

      const re = new RegExp(escapeRegExp(this.state.value), 'i');
      const isMatch = result => re.test(result.description);

      this.setState({
        isLoading: false,
        results: filter(this.props.eventsList, isMatch),
      });
    }, 500);
  }

  render = () => {
    const { eventsList, user } = this.props;
    const { isLoading, value, results, eventCreator } = this.state;
    console.log('eventCreator', eventCreator);
    return (
      <Container className="events-page" >
        <MenuBar />
        <Search
          loading={isLoading}
          onSearchChange={this.handleSearchChange}
          results={results}
          value={value}
          {...this.props}
        />
        <Divider />
        <Grid centered columns={2} stackable stretched >
          {eventsList === undefined ? null : eventsList.map((event) => {
            return (
              <GridEvent key={event.id} event={event} eventCreator={eventCreator} handleElementClick={this.handleElementClick} />
            );
          })}
        </Grid>
        <Modal
          dimmer="blurring"
          basic
          onClose={() => this.clearModalFocus()}
          size="small"
          open={Boolean(this.state.modalFocus)}
        >
          <Event
            parent="Grid"
            user={user}
            event={this.state.modalFocus}
            deleteClick=""
            changeModalFocusClick=""
            joinEvent={this.handleJoinEvent}
          />
        </Modal>
        <Waypoint
          onEnter={() => this.getMoreEvents()}
        />
      </Container>
    );
  }
}

const mapStatetoProps = ({ events, user }) => ({ 
  eventsList: events.eventsList,
  user,
});

export default connect(
  mapStatetoProps,
  {
    fetchEvents,
    joinEvent,
  })(Events);
