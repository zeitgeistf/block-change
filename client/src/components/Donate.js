import React, { Component } from 'react';
import axios from 'axios';
import { Dialog, TextField, FlatButton } from 'material-ui';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addProjects, setBalance, setProjectBalance, toggleDonate } from '../actions';

class Donate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      balance: '',
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.sendDonation = this.sendDonation.bind(this);
  }

  handleClose() {
    this.props.toggleDonate();
  }

  handleChange(e) {
    this.setState({
      amount: e.target.value,
    });
  }

  sendDonation() {
    const amount = parseInt(this.state.amount);
    if (this.props.balance === undefined) {
      alert('Please login before making a donation');
    } else if (this.props.balance < amount) {
      alert('Donation exceeds balance.');
    } else {
      this.props.setBalance(this.props.balance - amount);
      this.props.setProjectBalance(this.props.projectBalance + amount);
      this.props.toggleDonate();
      const params = {
        profile_id: this.props.currentUser.currentUserId,
        fromAddress: this.props.userWallet,
        toAddress: this.props.project.project_wallet,
        amount: this.state.amount,
        project_id: this.props.project.id
      };
      axios.post('/projects/sendTransaction', params)
      .then((res) => { console.log(res.data); this.props.getDonations(this.props.project.id); })
      .catch((err) => { console.log(err); });
    }
  }

  render() {
    const donateActions = [
      <FlatButton
        label="Confirm"
        primary
        onTouchTap={this.sendDonation}
      />,
      <FlatButton
        label="Cancel"
        primary
        onTouchTap={this.handleClose}
      />,
    ];
    const { title } = this.props.project;
    const dialogTitle = "Donate to " + title;
    return (
      <div>
        <Dialog
          title={dialogTitle}
          actions={donateActions}
          open={this.props.showDonate}
          onRequestClose={this.handleClose}
        >
          <div>Your Balance: {this.props.balance} </div>
          <TextField floatingLabelText="Amount" type="number" onChange={this.handleChange} value={this.state.amount}/>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    projects: state.main.projects,
    currentUser: state.profile,
  };
};

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators({
    setBalance, setProjectBalance, toggleDonate,
  }, dispatch);
};

export default connect(mapStateToProps, matchDispatchToProps)(Donate);
