# Hunts Point POS

[![Join the chat at https://gitter.im/afaqurk/hunts-point-pos](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/afaqurk/hunts-point-pos?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A simple, beautiful, & real-time Point of Sale system written in Node.js & Angular.js


#### [Try the Demo](http://pos.afaqtariq.com/)

# Quick Start

To start using hunts-point-pos:

## Step 1: Get code

Clone repo via git 
```bash
git clone https://github.com/afaqurk/hunts-point-pos.git
```

Or [download Hunts Point POS here](https://github.com/afaqurk/hunts-point-pos/archive/master.zip).

## Step 2: Install Dependencies

Go to the Hunts Point POS directory and run:

```bash
$ npm install
$ bower install
```

## Step 3: Run the app!

To start the app, run:

```bash
node server/
```

This will install all dependencies required to run the node app.

# Project Goals

## Planned Features for v0.5
- [ ] esc/pos integration
- [ ] scan-search on inventory page
- [ ] inventory increment page
- [ ] config page
- [ ] refund feature
- [ ] account for multiple cash registers
- [ ] reports feature
	- [ ] line graph of today's transactions (live updating)
	- [ ] line graph of transactions with date-range
	- [ ] line graph of product's selling history 


## Project Principles

- A clean & beautiful interface
- Feature-set targeted towards single store operation
- Seamless installation process
- Responsive web app accessible from any device on the network
- Plug & Play support for:
	- POS printers (ESC/POS)
	- Cash Drawers
	- Barcode Scanners (USB, Bluetooth)
	- Touch screen panel (USB)
