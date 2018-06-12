import React, { Component } from 'react';
import axios from 'axios'
import Web3 from 'web3'
import humanizeDuration from 'humanize-duration'

import calculateServiceAddress from './calculateServiceAddress'
import contractInfo from './rentCoinContractInfo'
import Address from './Address'

const timeUnitFactor = {
  second:   1,
  seconds:  1,
  minute:   60,
  minutes:  60,
  hour:     60 * 60,
  hours:    60 * 60,
  day:      60 * 60 * 24,
  days:     60 * 60 * 24,
  week:     60 * 60 * 24 * 7,
  weeks:    60 * 60 * 24 * 7,
  year:     60 * 60 * 24 * 365,
  years:    60 * 60 * 24 * 365,
}

export default class DeployOptions extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rawRangeValue: 2,
      feedback: null,
      hasTokens: null,
    }
  }

  // returns the number of seconds
  serviceTime = () => {
    const rawServiceTime = this.state.rawRangeValue ** 12

    const serviceTimeString = humanizeDuration(rawServiceTime * 1000, {
      largest: 1,
      round: true,
    })

    const [time, unit] = serviceTimeString.split(' ')

    if (timeUnitFactor[unit]) {
      return time * timeUnitFactor[unit]
    }

    return rawServiceTime
  }

  rentCoinAmount = () => {
    // rc(e-18) per second
    const rate = 3.858e9

    return this.serviceTime() * rate
  }

  deploy = () => {
    if (!this.props.serviceName) return

    return Promise.all([
      this.saveToServer(),
      this.pay()
    ])
  }

  saveToServer = () => {
    const { serviceName, serviceOptions } = this.props

    return axios.post(
      `/save`,
      {
        serviceName,
        serviceOptions,
      },
      {
        headers: {
          'Content-type': 'Application/json',
          'Accept': 'Application/json',
        }
      }
    )
    .then(response => {
      // if (response.status === 200) {
      //   console.log('Saved on server')
      // } else {
        console.log('Response from server after trying to save:', response)
      // }
    })
    .catch(error => {
      console.error('Not saved to server')
      console.error(error)
      console.log(error)
    })
  }

  pay = () => {
    const ethereumNetworkId = 3 // Ropsten
    const serviceName = this.props.serviceName
    const serviceOptions = this.props.serviceOptions

    const serviceAddress = calculateServiceAddress(serviceName, serviceOptions)
    const contractAddress = contractInfo.networks[ethereumNetworkId].address

    if (Web3.givenProvider) {
      const web3 = new Web3(Web3.givenProvider)

      return Promise.all([
        web3.eth.net.getId(),
        web3.eth.getAccounts(),
      ])
      .then(([ networkId, accounts ]) => {
        if (networkId !== ethereumNetworkId) {
          this.setState({
            feedback: 'You must be conncected to the Ropsten Test Network'
          })
          return
        }

        if (!accounts[0]) {
          this.setState({
            feedback: 'No accounts found. Are you logged in to MetaMask?'
          })
          return
        }

        const contract = new web3.eth.Contract(contractInfo.abi, contractAddress)

        const rentCoinAmount = this.rentCoinAmount()

        this.setState({
          feedback: `Transferring ${( rentCoinAmount * 1e-18 ).toFixed(9)} CurrentCoin to ${serviceAddress}`
        })

        return contract.methods.transfer(serviceAddress, rentCoinAmount)
          .send({
            from: accounts[0]
          })
          .then(receipt => {
            this.setState({
              feedback: (
                <div>
                Token transfer successful!

                <p>
                  In 10 to 30 seconds your service will be
                  available here: <a
                    className='service-link'
                    target='_blank'
                    href={`http://${serviceAddress}.s3-website.us-east-2.amazonaws.com`}
                  >
                    {`http://${serviceAddress}.s3-website.us-east-2.amazonaws.com`}
                  </a>
                </p>
                </div>
              )
            })

            console.log('transaction receipt:', receipt)
            return receipt
          });
      })
      .catch(error => {
        if (/User denied transaction signature/.test(error)) {
          console.log('User denied transaction signature')
        } else {
          console.error(error)
        }
      })
    } else {

      // waiting for transaction to mine / waiting for tokens to transfer
      // your transaction has been mined / tokens have been transferred
      // we are deploying your service
      // your service is now available at ...


      this.setState({
        feedback: (
          <div className='column' style={{
            alignItems: 'center'
          }}>
            <h3 className='h3'>Insert Coin, Activate Service</h3>
            <p>
              Your customized {serviceName} service has been saved in our database.
            </p>
            <p>
              We've detected that your browser does not have an Ethereum provider (MetaMask).
            </p>
            <p>
              Activate your service
              for {
                this.serviceTime()
              } seconds ({
                humanizeDuration(this.serviceTime() * 1000)
              })

              by sending {
                ( this.rentCoinAmount() / 1e18 ).toFixed(9)
              } CurrentCoin to
              {/* {console.log('Web3.utils:', Web3.utils)} */}
            </p>
            <Address address={serviceAddress} />

            <p>
              10 to 30 seconds after you make the transfer your service will be
              available here: <a
                className='service-link'
                target='_blank'
                href={`http://${serviceAddress}.s3-website.us-east-2.amazonaws.com`}
              >
                {`http://${serviceAddress}.s3-website.us-east-2.amazonaws.com`}
              </a>
            </p>

            <h3 className='h3'>Need RentCoin?</h3>
            <p>You'll get 1 CurrentCoin by sending 1 Ether to</p>
            <Address address={contractAddress} />

            <h3 className='h3'>Need Ether?</h3>
            <h3 className='h3'>Suggestions for wallets:</h3>
            <ul className='wallet-list'>
              <li>The browser wallet MetaMask can be installed in Chrome, Firefox, or Opera. This allows you to skip the step of scanning or copying an address.</li>
              <li>A browser with a built in wallet such as Brave or Cipher Browser (mobile) has the same advantage.</li>
              <li>A mobile wallet such as Trust allows you to scan addresses as QR codes and send Ether or ERC20 complient tokens.</li>
              <li>www.myetherwallet.com</li>
              <li>Ethereum Wallet</li>
              <li>Hardware wallet</li>
            </ul>
          </div>
        )
      })
    }
  }

  render() {
    return (
      <div className='deploy'>
        {
          this.state.feedback
          ? (
            <div className='deploy-feedback td'>
              <i
                className='fa fa-times close-feedback'
                onClick={() => this.setState({feedback: null})}
              />
                {this.state.feedback}
            </div>
          )
          : null
        }
        <div
          className='deploy-button'
          onClick={this.deploy.bind(this)}
          tabIndex='0'
          onKeyPress={event => {
            if (event.key === ' ') {
              this.deploy()
            }
          }}
        >
          DEPLOY
        </div>
        <div className='deploy-service-time'>
          <div className='deploy-service-time-value'>
            {
              humanizeDuration(this.serviceTime() * 1000, {
                largest: 1,
                round: true,
              })
            }
          </div>
          <input
            className='deploy-service-time-input'
            type='range'
            min='1.45'
            max='3'
            step='0.01'
            value={this.state.rawRangeValue}
            onChange={event => {
              this.setState({
                rawRangeValue: event.target.value
              })
            }}
          />
        </div>
      </div>
    )
  }
}
