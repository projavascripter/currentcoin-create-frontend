import React, { Component } from 'react'

const etherscanAddress = 'https://rinkeby.etherscan.io'

/*
  The shape of this.props.tasks is
    {
      serviceAddress0: {
        transferState: {
          inProgress: bool,
          complete: bool,
          error: bool,
          transactionHash,
          errorMessage,
        },
        deployState: {
          inProgress: bool,
          complete: bool,
          error: bool,
          serviceUrl,
          errorMessage,
        },
      },
      serviceAddress1: {
        transferState: {
          ...
        },
        deployState: {
          ...
        },
      },
      serviceAddress2: {
        ...
      },
      ...
    }
*/

class Progress extends Component {
  render() {
    if (Object.keys(this.props.tasks).length === 0)
      return null

    return (
      <div className='progress column'>
        {
          Object.keys(this.props.tasks).map(serviceAddress => {
            const {
              transferState,
              deployState,
            } = this.props.tasks[serviceAddress]

            return [
              <div className='progress-row' key='0'>
                {
                  transferState.error
                    ? (
                      transferState.errorMessage
                        ? transferState.errorMessage
                        : 'There was a problem transferring coins'
                    )
                    : transferState.inProgress
                      ? (
                        'Transferring Coins'
                        <i className='fa fa-spinner fa-pulse' />
                      )
                      : transferState.complete
                        ? (
                          Coins Transferred
                          <i className='fa fa-check' />
                          <a
                            target='_blank'
                            className='small-link'
                            href={`${etherscanAddress}/tx/${transferState.transactionHash}`}
                          >
                            etherscan
                          </a>
                        )
                        : null
                }
              </div>,
              <div  className='progress-row' key='1'>
                {
                  deployState.error
                    ? (
                      deployState.errorMessage
                        ? deployState.errorMessage
                        : 'There was a problem deploying your service'
                    )
                    : deployState.inProgress
                      ? (
                        'Deploying service'
                        <i className='fa fa-spinner fa-pulse' />
                      )
                      : deployState.complete
                        ? (
                          Service Deployed
                          <i className='fa fa-check' />
                          <a
                            target='_blank'
                            className='small-link'
                            href={deployState.serviceUrl}
                          >
                            link
                          </a>
                        )
                        : null
                }
              </div>
            ]
          }
        }
      </div>
    )

    // return <div className='progress column'>
    //   {
    //     Object.keys(this.props.tasks).map(serviceAddress => {
    //       const {
    //         state,
    //         txHash,
    //         serviceUrl,
    //         errorMessage,
    //       } = this.props.tasks[serviceAddress]
    //
    //       if (state === 'error' || state === 3) {
    //         return [
    //           <div className='progress-row' key='0'>
    //             {
    //               errorMessage
    //                 ? errorMessage
    //                 : 'There was a problem deploying the service.'
    //             }
    //           </div>,
    //           <div  className='progress-row' key='1'>
    //             Your service may or may not be available shortly at&nbsp;
    //             <a
    //               target='_blank'
    //               className='small-link'
    //               href={serviceUrl}
    //             >
    //               link
    //             </a>
    //           </div>
    //         ]
    //       } else if (state === 'transferring' || state === 0) {
    //         return (
    //           <div className='progress-row'>
    //             Transferring Coins&nbsp;
    //             <i className='fa fa-spinner fa-pulse' />
    //           </div>
    //         )
    //       } else if (state === 'deploying' || state === 1) {
    //         return [
    //           <div className='progress-row' key='0'>
    //             Coins Transferred&nbsp;
    //             <i className='fa fa-check' />&nbsp;
    //             <a
    //               target='_blank'
    //               className='small-link'
    //               href={`${etherscanAddress}/tx/${txHash}`}
    //             >
    //               etherscan
    //             </a>
    //           </div>,
    //           <div className='progress-row' key='1'>
    //             Deploying Service&nbsp;
    //             <i className='fa fa-spinner fa-pulse' />
    //           </div>
    //         ]
    //       } else if (state === 'done' || state === 2) {
    //         return [
    //           <div className='progress-row' key='0'>
    //             Coins Transferred&nbsp;
    //             <i className='fa fa-check' />&nbsp;
    //             <a
    //               target='_blank'
    //               className='small-link'
    //               href={`${etherscanAddress}/tx/${txHash}`}
    //             >
    //               etherscan
    //             </a>
    //           </div>,
    //           <div className='progress-row' key='1'>
    //             Service Deployed&nbsp;
    //             <i className='fa fa-check' />&nbsp;
    //             <a
    //               target='_blank'
    //               className='small-link'
    //               href={serviceUrl}
    //             >
    //               link
    //             </a>
    //           </div>
    //         ]
    //       } else {
    //         return null
    //       }
    //     })
    //   }
    // </div>
  }
}

export default Progress
