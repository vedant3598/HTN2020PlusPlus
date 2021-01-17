/* When the user clicks on the button, toggle between hiding and showing the dropdown content */
function toggle() {
  console.log("toggle");
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i=0; i<dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

document.getElementById('searchBtn').addEventListener('click', searchTags, false);

function searchTags() {
  console.log("search");
  var searchArr = document.getElementById('searchBar').value.split(',');
  console.log(searchArr);
  document.getElementById('tagsFound').innerHTML = "";
  $.ajax({
    url: "/userInfo",
    data: {
      "tag": searchArr
    },
    type: "GET",
    success: function(result) {
      console.log("result =", result.ideas);
      $("#tagsFound").append("<div class=\"item\"><h3");
    }
  });
}
