$(document).ready(function () {
    $(".openFormButton").on("click", function () {
        $("#modalContainer").load("contact-modal.html", function () {
            $("#contactModal").modal("show");
  
            $("#contactForm").on("submit", function (event) {
                event.preventDefault();
  
                let name = $("#name").val();
                let phone = $("#phone").val();
                let age = $("#age").val();
                let service = $("#service").val();
                let date = $("#date").val();
                let time = $("#time").val();
  
                if (time < "09:00" || time > "20:00") {
                    alert("Please select a time between 9:00 AM and 8:00 PM.");
                    return;
                }
  
                let message = `Name: ${name}
  Phone: ${phone}
  Age: ${age}
  Service: ${service}
  Date: ${date}
  Time: ${time}
  `;
  
                let encodedMessage = encodeURIComponent(message.trim());
  
                let phoneNumber = "918767531916"; // Replace with the desired phone number, including the country code without any '+' or '00' prefix
                let whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
                window.open(whatsappUrl, '_blank');
            });
        });
    });
  });
  