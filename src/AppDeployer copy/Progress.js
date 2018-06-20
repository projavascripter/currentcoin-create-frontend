import React, { Component } from 'react'

const etherscanAddress = 'https://rinkeby.etherscan.io'

/*
  The shape of this.props.tasks is
  {
    serviceAddress0: { state, txHash, serviceUrl, errorMessage },
    serviceAddress1: { state, txHash, serviceUrl, errorMessage },
    serviceAddress2: { state, txHash, serviceUrl, errorMessage },
    ...
  }

  state can be one of 0, 1, 2, 3
  or one of 'transferring', 'deploying', 'done', 'error'
*/

class Progress extends Component {
  render() {
    if (Object.keys(this.props.tasks).length === 0)
      return null

    return <div className='progress column'>
      {
        Object.keys(this.props.tasks).map(serviceAddress => {
          const {
            state,
            txHash,
            serviceUrl,
            errorMessage,
          } = this.props.tasks[serviceAddress]

          if (state === 'error' || state === 3) {
            return [
              <div className='progress-row' key='0'>
                {
                  errorMessage
                    ? errorMessage
                    : 'There was a problem deploying the service.'
                }
              </div>,
              <div  className='progress-row' key='1'>
                Your service may or may not be available shortly at&nbsp;
                <a
                  target='_blank'
                  className='small-link'
                  href={serviceUrl}
                >
                  link
                </a>
              </div>
            ]
          } else if (state === 'transferring' || state === 0) {
            return (
              <div className='progress-row'>
                Transferring Coins&nbsp;
                <i className='fa fa-spinner fa-pulse' />
              </div>
            )
          } else if (state === 'deploying' || state === 1) {
            return [
              <div className='progress-row' key='0'>
                Coins Transferred&nbsp;
                <i className='fa fa-check' />&nbsp;
                <a
                  target='_blank'
                  className='small-link'
                  href={`${etherscanAddress}/tx/${txHash}`}
                >
                  etherscan
                </a>
              </div>,
              <div className='progress-row' key='1'>
                Deploying Service&nbsp;
                <i className='fa fa-spinner fa-pulse' />
              </div>
            ]
          } else if (state === 'done' || state === 2) {
            return [
              <div className='progress-row' key='0'>
                Coins Transferred&nbsp;
                <i className='fa fa-check' />&nbsp;
                <a
                  target='_blank'
                  className='small-link'
                  href={`${etherscanAddress}/tx/${txHash}`}
                >
                  etherscan
                </a>
              </div>,
              <div className='progress-row' key='1'>
                Service Deployed&nbsp;
                <i className='fa fa-check' />&nbsp;
                <a
                  target='_blank'
                  className='small-link'
                  href={serviceUrl}
                >
                  link
                </a>
              </div>
            ]
          } else {
            return null
          }
        })
      }
    </div>
  }
}

export default Progress
