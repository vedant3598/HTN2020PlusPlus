var event = "", category = "", tag;

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
  var query = document.getElementById('searchBar').value;
  console.log(query);
  document.getElementById('tagsFound').innerHTML = "";
  $.ajax({
    url: "/ideas",
    data: {
      "tags": query
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

function selectEvent(item) {
  event = item.value;
  console.log("event =", event);
}

function selectCategory(item) {
  category = item.value;
  console.log("category =", category);
}

function searchTagsPosts() {
  console.log("search posts");
  var query = document.getElementById('searchBar').value;
  tag = query;
  console.log("tag =", tag, "category =", category, "event =", event);
  document.getElementById('commentsFound').getElementsByClassName("row")[0].innerHTML = "";
  $.ajax({
    url: "/team_posts",
    data: {
      "category": category,
      "event": event,
      "tags": tag
    },
    type: "GET",
    success: function(result) {
      console.log("result =", result);
      if (result.length === 0) {
        var str = "<h4 style=\"text-align: center;\">No tags found</h4>";
        $("#commentsFound").find(".row").append(str);
      } else {
        result.forEach((item, idx) => {
          var str = "";
          console.log(item, idx);
          /*
          if (item._id) {
            $.ajax({
              url: "/profileInfo",
              data: {
                "user": item.owner
              },
              type: "GET",
              success: function(result1) {
                console.log("result1 =", result1);
                if (result1.profile_pic_url !== undefined) {
                  console.log("huh");
                  if (idx > 0) {
                    str = "div class=\"column\" style=\"background-color: white; margin-top: 50px;\"><div style=\"display: inline-flex;\"<img src=" + result1.profile_pic_url + " width=\"10%\" style=\"margin-right: 80px;\"><h3> Username: " + item.owner + "</h3><h3 style=\"margin-left: 50px;\">Event: " + item.event + "</h3></h3><h3 style=\"margin-left: 50px;\">Categories: " + item.categories[0] + "</h3></h3><h3 style=\"margin-left: 50px;\">Tags: " + item.tags[0] + "</h3></div><p style=\"float: left; padding-left: 50px; padding-top: 50px; font-size: 24px;\">" + item.text + "</p></div>";
                  } else {
                    str = "div class=\"column\" style=\"background-color: white;\"><div style=\"display: inline-flex;\"<img src=" + result1.profile_pic_url + " width=\"10%\" style=\"margin-right: 80px;\"><h3> Username: " + item.owner + "</h3><h3 style=\"margin-left: 50px;\">Event: " + item.event + "</h3></h3><h3 style=\"margin-left: 50px;\">Categories: " + item.categories[0] + "</h3></h3><h3 style=\"margin-left: 50px;\">Tags: " + item.tags[0] + "</h3></div><p style=\"float: left; padding-left: 50px; padding-top: 50px; font-size: 24px;\">" + item.text + "</p></div>";
                  }
                }
              }
            });
          } else {
            */
            if (idx > 0) {
              str = "<div class=\"column\" style=\"background-color: white; margin-top: 50px;\"><div style=\"display: inline-flex;\"><img src=" + "https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png" + " width=\"10%\" style=\"margin-right: 80px;\"><h3> Username: " + item.owner + "</h3><h3 style=\"margin-left: 50px;\">Event: " + item.event + "</h3></h3><h3 style=\"margin-left: 50px;\">Categories: " + item.categories[0] + "</h3></h3><h3 style=\"margin-left: 50px;\">Tags: " + item.tags[0] + "</h3></div><p style=\"float: left; padding-left: 50px; padding-top: 50px; font-size: 24px;\">" + item.text + "</p></div>";
            } else {
              str = "<div class=\"column\" style=\"background-color: white;\"><div style=\"display: inline-flex;\"><img src=" + "https://www.shoptab.net/blog/wp-content/uploads/2014/07/profile-circle.png" + " width=\"10%\" style=\"margin-right: 80px;\"><h3> Username: " + item.owner + "</h3><h3 style=\"margin-left: 50px;\">Event: " + item.event + "</h3></h3><h3 style=\"margin-left: 50px;\">Categories: " + item.categories[0] + "</h3></h3><h3 style=\"margin-left: 50px;\">Tags: " + item.tags[0] + "</h3></div><p style=\"float: left; padding-left: 50px; padding-top: 50px; font-size: 24px;\">" + item.text + "</p></div>";
            }
          // }
          console.log("str =", str);
          $("#commentsFound").find(".row").append(str);
        });
        /* <div class="column" style="background-color: white; border-color: black;">
                <div style="display: inline-flex;">
                    <img src="https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png" width="10%" style="margin-right: 80px;">
                  <h3>Username: test_32323</h3>
                  <h3 style="margin-left: 50px;">Event: HTN2020</h3>
                  <h3 style="margin-left: 50px;">Categories: Gaming</h3>
                  <h3 style="margin-left: 50px;">Tags: AR/VR</h3>
                </div>
                <p style="float: left; padding-left: 50px; padding-top: 50px; font-size: 24px;">Looking for someone who is good with game design, has Unity3D experience, etc...</p>
              </div> */
      }
      // result = result.filter((item) => {
        // return item.attachmentUrls.length > 0;
      // });
      
    }
  });  
}

$("#myForm").submit((e) => {
  console.log("whattt");
  e.preventDefault();
});

