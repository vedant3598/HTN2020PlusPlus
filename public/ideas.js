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

// document.getElementById('commentsFound').addEventListener('click', getPosts, false);

function searchTags() {
  console.log("search");
  var searchArr = document.getElementById('searchBar').value;
  console.log(searchArr);
  document.getElementById('tagsFound').innerHTML = "";
  $.ajax({
    url: "/ideas",
    data: {
      "tags": searchArr
    },
    type: "GET",
    success: function(result) {
      console.log("result =", result);
      // result = result.filter((item) => {
        // return item.attachmentUrls.length > 0;
      // });
      if (result.length === 0) {
        var str = "<h4 style=\"text-align: center;\">No tags found</h4>";
        $("#tagsFound").append(str);
      } else {
        result.forEach((item) => {
          var str = "";
          if (item.attachmentUrls.length > 0) {
            if (!item.attachmentUrls[0].includes(".png") && !item.attachmentUrls[0].includes(".jpg")) {
              str = "<div class=\"item\"><h3>" + item.text + "</h3><p>Tags: " + item.tags.join(", ") + "<br><br>" + "Categories: " + item.categories.join(", ") + "</p></div>";
            } else {
              str = "<div class=\"item\"><h3>" + item.text + "</h3><img src=" + item.attachmentUrls[0] + "><p>Tags: " + item.tags.join(", ") + "<br><br>" + "Categories: " + item.categories.join(", ") + "</p>" + "<br><i style=\"font-size: 24px; float: right;\" class=\"fa\">&#xf0c6;</i></div>";
            }
          } else {
            var str = "<div class=\"item\"><h3>" + item.text + "</h3><p>Tags: " + item.tags.join(", ") + "<br><br>" + "Categories: " + item.categories.join(", ") + "</p></div>";
          }
          console.log("str =", str);
          $("#tagsFound").append(str);
        });
      }
    }
  });
}
