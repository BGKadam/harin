
function sendmessage() {
  // Get all the values from the form
  var requestname = document.getElementById("requestname").value;
  var requestemail = document.getElementById("requestemail").value;
  var requestphone = document.getElementById("requestphone").value;
  var bookingage = document.getElementById("bookingage").value;
  var requestservice = document.getElementById("requestservice").value;
  var requestdate = document.getElementById("requestdate").value;
  var requesttime = document.getElementById("requesttime").value;
  var bookingmessage = document.getElementById("bookingmessage").value;

  // Create a message string
  var message = `Name: ${requestname}\nEmail: ${requestemail}\nPhone: ${requestphone}\nAge: ${bookingage}\nService: ${requestservice}\nDate: ${requestdate}\nTime: ${requesttime}\nMessage: ${bookingmessage}`;

  // Create a WhatsApp URL
  var whatsappURL = "https://wa.me/918767531916?text=" + encodeURIComponent(message);

  // Open the WhatsApp URL in a new window
  window.open(whatsappURL, "_blank");

  // Prevent the form from actually submitting
  return false;
}
