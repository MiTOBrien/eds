# Early Draft Society

Early Draft Society (EDS) is a website created and designed to allow authors to find arc/beta/proof readers to work with on reading and editing their books before publication. Authors accounts are always free and arc/beta/proof readers who don't charge a fee for their services also get free accounts. Arc/beta/proof readers who charge for their services can subscribe after joining to unlock the features to set up pricing tiers, payment methods, etc. On the homepage authors have the ability to search for specific readers and filter readers based on type of reader, free vs. paid, and readers that specialize in specific genres.

## Deployed Site

[Early Draft Society](https://earlydraftsociety.com/)

## Backend Repo

[EDS Backend](https://github.com/MiTOBrien/ebs-be)

## Technology Used
- [Vue](https://vuejs.org/) 3.5.13 installed with Vite 6.1.0 for the front end
- Vue Router 4.5.0
- Pinia for state management
- JavaScript
- Prettier extensions in VSCode
- CloudFlare for profile image storage
- Mailgun for Welcome and Forgot Password emails

## Getting Started
To run this locally clone this repository onto your local machine. Change directory into the early draft society directory and run npm install to install all dependiences. To launch the front end application:

```sh
npm run dev
```
NOTE: To utilize the application you will need to also clonse down and run the backend code.

### Compile and Minify for Production

```sh
npm run build
```
