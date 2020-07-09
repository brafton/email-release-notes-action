const core = require('@actions/core');
const github = require('@actions/github');
const request = require('request');
const nodemailer = require("nodemailer");

var githubToken = "";
var repoName = "";
var emailPassword = "";

/**
 * main
 */
async function main() {

  // var argv = require('minimist')(process.argv.slice(2));

  // // 1. email creadential and github release note token
  // //    to be passed through console
  // //    i.e. node entrypoint --email_creds=the_email_creds --github_releases_token=the_github_releases_token --repo_name=the_repo_name
  // var email_creds = argv.email_creds;
  // var github_releases_token = Buffer.from(argv.github_releases_token).toString('base64');
  // var repo_name = argv.repo_name;

  // 2. do http request to github to get release note generated by probot
  var response = await get_release_note(this.githubToken, this.repoName);

  var release_note;
  var is_draft;
  var subject;
  var prettyName = to_title_case(this.repoName);

  if (!!response == true && Array.isArray(response) == true) {
      release_note = response[0];
  }
  else if (!!response == true && Array.isArray(response) == false) {
      release_note = response;
  }

  is_draft = (!!release_note == true && release_note.draft == true);
  subject = is_draft == true ? `${prettyName} Staging Release ${release_note.tag_name}` : `${prettyName} Production Release ${release_note.tag_name}`;

  // 3. send the email
  await send_email(this.emailPassword, subject, release_note.body_html)
}

/**
* send the email
* @param email_creds the smtp credential password
* @param subject 
* @param body_html the release note html to be sent
*/
async function send_email(email_creds, subject, body_html) {
  // 1. create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
          user: "stewart.snow@brafton.com",
          pass: email_creds
      }
  });

  var payload = `<h2>${subject}</h2> ${body_html}`

  // 2. send mail with defined transport object
  var info = await transporter.sendMail({
      from: '"Stewart Snow" <stewart.snow@brafton.com>', // sender address
      to: "stewart.snow@brafton.co.uk", // list of receivers
      cc: "stewart.snow@brafton.com",
      subject: subject, // Subject line
      html: payload //html body
  });
}

/**
* fetch release note via github api
* @param github_releases_token github Basic Authentication i.e. Basic username:password
* @param repo_name the name of the repo for which to get latest release note
*/
async function get_release_note(github_releases_token, repo_name) {


  var options = {
      url: `https://api.github.com/repos/brafton/${repo_name}/releases`,
      headers: {
          'Authorization': `Basic ${github_releases_token}`,
          'User-Agent': `${repo_name}`,
          // this ensure that the body of the response payload is html
          'Accept': 'application/vnd.github.v3.html+json' 
      },
  };

  var response = await new Promise(function (resolve, reject) {
      request.get(options, function (error, response, body) {
          if (error)
              reject(error);
          else
              resolve(JSON.parse(body));
      });
  });

  return response;

}

function to_title_case(text) {
  var splitText = text.replace('-', ' ').replace('_', ' ');
  var arrayText = splitText.split(' ');
  var arrayTextToTitleCase = arrayText.map(x => x.charAt(0).toUpperCase() + x.substring(1));
  var prettyText = arrayTextToTitleCase.join(' ');
  return prettyText;
}


try {
  // pickup input parameters
  this.githubToken = core.getInput('github_token');
  this.repoName = core.getInput('repo_name');
  this.emailPassword = core.getInput('email_password');

  console.log(`Hello ${this.repoName}!`);

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  // call the main function and do the work
  main();


} catch (error) {
  core.setFailed(error.message);
}
