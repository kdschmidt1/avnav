/**
 * Created by andreas on 23.02.16.
 */

import React from "react";
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Helper from '../util/helper.js';
import GuiHelper from '../util/GuiHelpers.js';
const modalRoot = document.getElementById('leftSection');

class KDWidget extends React.Component{
  constructor(props) {
        super(props);
	    this.el = document.createElement('div')
        this.myRef = React.createRef();
        GuiHelper.nameKeyEventHandler(this,"widget")
    }
    shouldComponentUpdate(nextProps,nextState) {
        return false;
    }
  

  componentDidMount() {
    // The portal element is inserted in the DOM tree after
    // the Modal's children are mounted, meaning that children
    // will be mounted on a detached DOM node. If a child
    // component requires to be attached to the DOM tree
    // immediately when mounted, for example to measure a
    // DOM node, or uses 'autoFocus' in a descendant, add
    // state to Modal and only render the children when Modal
    // is inserted in the DOM tree.
	const modalRoot = document.getElementById('new_pages')
	if(modalRoot){
    modalRoot.appendChild(this.el);
	}
  }

  componentWillUnmount() {
	const modalRoot = document.getElementById('new_pages')
	if(modalRoot){
    	modalRoot.removeChild(this.el);
	}
  }

  render() {
	let classes="widget KDWidget";
    return ReactDOM.createPortal(
	<div className={classes} onClick={this.props.onClick} style={this.props.style}>
	<div className="resize">
            <div className='widgetData'>
                {this.props.name}
            </div>
            </div>,
            </div>,

      this.el
    );
  }

}


export default KDWidget;