"use strict";

app.controller("Root", function($scope, $routeParams, $location, $http) {
  /**
   ****************** New Tour Package and Detailed Itinerary ******************
   */

  if (localStorage.getItem("session")) {
    $scope.session = JSON.parse(localStorage.getItem("session"));
    $scope.sessionid = $scope.session.sessionid;
    $scope.userid = $scope.session.userid;
    $scope.type = $scope.session.type;
    $scope.email = $scope.session.email;
    $scope.user = $scope.email.substr(0, $scope.email.indexOf("@"));
  }

  $scope.PackageModel = {
    package_image_name: "",
    discount: "",
    popular: false,
    flag: "create",
    user: $scope.userid
  };

  var fd = new FormData();
  $scope.User = { password: "" };
  $scope.itinerary = [{ id: 1, title: "", description: "" }];
  $scope.attractions = [{ id: 1, title: "", image_name: "" }];
  $scope.carousel = [];
  $scope.facilities = {
    Breakfast: false,
    PickDrop: false,
    Hotel: false,
    Guide: false
  };
  $scope.ItineraryModel = {
    itinerary: $scope.itinerary,
    tourist_attractions: $scope.attractions,
    carousel: $scope.carousel,
    facilities: $scope.facilities
  };
  $scope.CreateModel = { ...$scope.PackageModel, ...$scope.ItineraryModel };

  $scope.navigate = function(path) {
    $location.path(path + "/" + $scope.sessionid);
  };

  $scope.isActive = function(viewLocation) {
    return viewLocation === $location.path();
  };

  $scope.OnInit = function() {
    $http.get("/api/destination?d=all").then(
      function(response) {
        $scope.DestinationModel = response.data.results;
      },
      function(response) {
        alert(response.data);
      }
    );
  };

  $scope.AddItinerary = function() {
    if ($scope.EditModel != undefined) {
      var newid = $scope.EditModel.itinerary.length + 1;
      $scope.EditModel.itinerary.push({ id: newid, description: "" });
    } else {
      var newid = $scope.itinerary.length + 1;
      $scope.itinerary.push({ id: newid, description: "" });
    }
  };

  $scope.AddAttraction = function() {
    if ($scope.EditModel != undefined) {
      var newid = $scope.EditModel.tourist_attractions.length + 1;
      $scope.EditModel.tourist_attractions.push({
        id: newid,
        title: "",
        image_name: ""
      });
    } else {
      var newid = $scope.attractions.length + 1;
      $scope.attractions.push({ id: newid, title: "", image_name: "" });
    }
  };

  $scope.DeleteItinerary = function(index) {
    if ($scope.EditModel != undefined) {
      $scope.EditModel.itinerary.splice(index, 1);
    } else {
      $scope.itinerary.splice(index, 1);
    }
  };

  $scope.DeleteAttraction = function(index) {
    if ($scope.EditModel != undefined) {
      $scope.EditModel.tourist_attractions.splice(index, 1);
    } else {
      $scope.attractions.splice(index, 1);
    }
  };

  $scope.ShowAdd = function(add) {
    if ($scope.EditModel != undefined) {
      return (add.id === $scope.EditModel.itinerary[$scope.EditModel.itinerary.length - 1].id);
    } else {
      return add.id === $scope.itinerary[$scope.itinerary.length - 1].id;
    }
  };

  $scope.ShowAdded = function(add) {
    if ($scope.EditModel != undefined) {
      return (add.id === $scope.EditModel.tourist_attractions[$scope.EditModel.tourist_attractions.length - 1].id);
    } else {
      return add.id === $scope.attractions[$scope.attractions.length - 1].id;
    }
  };

  $scope.ShowDelete = function(del) {
    return del.id !== 1;
  };

  $scope.ShowDeleted = function(del) {
    return del.id !== 1;
  };

  $scope.getAllTours = function() {
    if (localStorage.getItem("session")) {
      if ($scope.session.sessionid === $routeParams.session) {
        $scope.ShowOverlay();
        $http.get("/api/packages").then(
          function(response) {
            $scope.InitialModel = angular.copy(response.data);
            var data = response.data.results;
            $scope.format(data);
            $scope.HideOverlay();
          },
          function(response) {
            $scope.HideOverlay();
            alert(response.data);
          }
        );
      }
    }
  };

  $scope.UploadPackImg = function(files) {
    fd.append("file[]", files[0]);
    var reader = new FileReader();
    reader.onload = function() {
      if ($scope.EditModel == undefined) {
        $scope.CreateModel.package_image_name = files[0].name;
      } else {
        $scope.EditModel.package_image_name = files[0].name;
      }
      document.querySelector("#image").src = reader.result;
    };
    reader.readAsDataURL(files[0]);
  };

  $scope.UploadAttractionImg = function(files, index) {
    fd.append("file[]", files[0]);
    var reader = new FileReader();
    reader.onload = function() {
      if ($scope.EditModel != undefined) {
        $scope.EditModel.tourist_attractions[index].image_name = files[0].name;
      } else {
        $scope.attractions[index].image_name = files[0].name;
      }
      document.querySelector("#src" + index).innerHTML = `<img src="${reader.result}" alt="${files[0].name}"/>`;
    };
    reader.readAsDataURL(files[0]);
  };

  $scope.UploadCarouselImg = function(files) {
    document.querySelector("#carousel-images").innerHTML = "";
    for (let i = 0; i < files.length; i++) {
      fd.append("file[]", files[i]);
      (function(file) {
        var filename = file.name;
        var reader = new FileReader();
        reader.onload = function() {
          if ($scope.EditModel != undefined) {
            $scope.EditModel.carousel.push({ image_name: filename });
          } else {
            $scope.CreateModel.carousel.push({ image_name: filename });
          }
          document.querySelector(
            "#carousel-images"
          ).innerHTML += `<img src="${reader.result}" alt="${filename}"/>`;
        };
        reader.readAsDataURL(file);
      })(files[i]);
    }
  };

  $scope.createPackage = function() {
    if ($scope.type !== "0") {
      if ($scope.CreateModel.package_image_name !== "") {
        if ($scope.CreateModel.carousel.length > 0) {
          var flag = 0;
          var attractions = $scope.CreateModel.tourist_attractions;
          for (let i = 0; i < attractions.length; i++) {
            if (attractions[i].image_name === "") {
              flag++;
            }
          }
          if (flag === 0) {
            $scope.operate();
            $http.post("/api/create", $scope.CreateModel).then(
                function(response) {
                  $http.post("/api/upload?no=" + response.data.no,
                      fd,
                      {
                        transformRequest: angular.identity,
                        headers: {
                          "Content-Type": undefined,
                          "Process-Data": false
                        }
                      }
                    ).then(
                      function() {
                        $scope.CreateModel = {};
                        alert(response.data.message);
                        $location.path("/dashboard/" + $scope.sessionid);
                      },
                      function(response) {
                        $scope.deoperate("Save");
                        alert(response.data);
                      }
                    );
                },
                function(response) {
                  $scope.deoperate("Save");
                  alert(response.data);
                }
              );
          } else {
            alert("Tourist Attraction Images are required");
          }
        } else {
          alert("Carousel Images are required");
        }
      } else {
        alert("Package Image is required");
      }
    } else {
      alert("You are not an authorized user");
    }
  };

  $scope.format = function(data) {
    for (let i = 0; i < data.length; i++) {
      data[i].actual_budget = parseInt(data[i].actual_budget).toLocaleString("en-IN");
      data[i].budget_per_day = parseInt(data[i].budget_per_day).toLocaleString("en-IN");
      data[i].discount_budget = parseInt(data[i].discount_budget).toLocaleString("en-IN");
      data[i].package_info = unescape(data[i].package_info);
      data[i].package_info = data[i].package_info.split(". ");
      var departure_date = new Date(data[i].departure_date);
      var month = departure_date.toLocaleString("en-us", { month: "long" });
      data[i].departure_date = departure_date.getDate() + " " + month + " " + departure_date.getFullYear();
    }
    $scope.ReadModel = data;
  };

  $scope.LoginValidate = function() {
    $scope.ShowOverlay();
    $http.get(
        "/api/authenticate?email=" + $scope.LoginModel.email + "&password=" + $scope.LoginModel.pass
      ).then(
        function(response) {
          localStorage.setItem("session", JSON.stringify(response.data));
          $location.path("/dashboard/" + response.data.sessionid);
          $scope.HideOverlay();
        },
        function(response) {
          $scope.HideOverlay();
          if (response.data.message) {
            document.querySelector("#login-error").innerHTML = response.data.message;
          } else {
            $scope.HideOverlay();
          }
        }
      );
  };

  $scope.LogOut = function() {
    $http.get("/api/authenticate").then(
      function() {
        localStorage.clear();
        $location.path("/");
      },
      function(response) {
        alert(response.data);
      }
    );
  };

  $scope.handleEdit = function(no) {
    let data = $scope.InitialModel.results.filter(tours => tours.package_no === no);
    localStorage.setItem("edit", JSON.stringify(data[0]));
    $location.path("/edit/" + $scope.sessionid);
  };

  $scope.getEditTour = function() {
    if (localStorage.getItem("edit")) {
      let edit = JSON.parse(localStorage.getItem("edit"));
      edit.discount = edit.discount === "0" ? "" : edit.discount;
      edit.departure_date = new Date(edit.departure_date);
      edit.popular = edit.popular === "1" ? true : false;
      edit.facilities = JSON.parse(edit.facilities);
      edit.tourist_attractions = JSON.parse(edit.tourist_attractions);
      for (let i = 0; i < edit.tourist_attractions.length; i++) {
        if (!edit.tourist_attractions[i].image_name.includes(edit.package_no)) {
          edit.tourist_attractions[i].image_name =
            edit.package_no + "_" + edit.tourist_attractions[i].image_name;
        }
      }
      edit.itinerary = JSON.parse(edit.itinerary);
      edit.carousel = JSON.parse(edit.carousel);
      for (let i = 0; i < edit.carousel.length; i++) {
        if (!edit.carousel[i].image_name.includes(edit.package_no)) {
          edit.carousel[i].image_name =
            edit.package_no + "_" + edit.carousel[i].image_name;
        }
      }
      $scope.EditModel = edit;
      $scope.OnInit();
    } else {
      $location.path("/dashboard/" + $scope.sessionid);
    }
  };

  $scope.EditPackage = function() {
    if ($scope.EditModel.package_image_name !== "") {
      if ($scope.EditModel.carousel.length > 0) {
        var flag = 0;
        var attractions = $scope.EditModel.tourist_attractions;
        for (let i = 0; i < attractions.length; i++) {
          if (attractions[i].image_name === "") {
            flag++;
          }
        }
        if (flag === 0) {
          $scope.operate();
          $scope.EditModel.flag = "edit";
          $http.post("/api/create", $scope.EditModel).then(
              function(response) {
                $http.post("/api/upload?no=" + response.data.no,
                    fd,
                    {
                      transformRequest: angular.identity,
                      headers: {
                        "Content-Type": undefined,
                        "Process-Data": false
                      }
                    }
                  )
                  .then(
                    function() {
                      alert(response.data.message);
                      localStorage.removeItem("edit");
                      $location.path("/dashboard/" + $scope.sessionid);
                      $scope.EditModel = {};
                    },
                    function(response) {
                      $scope.deoperate("Edit");
                      alert(response.data);
                    }
                  );
              },
              function(response) {
                $scope.deoperate("Edit");
                alert(response.data);
              }
            );
        } else {
          alert("Tourist Attraction Images are required");
        }
      } else {
        alert("Carousel Images are required");
      }
    } else {
      alert("Package Image is required");
    }
  };

  $scope.handleDelete = function(no) {
    var del = confirm("Are you sure you want to delete " + no + " ?");
    if (del == true) {
      $http.get("/api/delete?no=" + no).then(
        function(response) {
          alert(response.data.message);
          $scope.getAllTours();
        },
        function(response) {
          alert(response.data);
        }
      );
    }
  };

  $scope.getUserProfile = function() {
    $scope.Profile = angular.copy($scope.session);
    $scope.Profile.type = $scope.Profile.type === "1" ? "Admin" : "Subscriber";
  };

  $scope.GeneratePass = function(val) {
    var pass = Math.random().toString(36).slice(-8);
    document.querySelector("#password").value = pass;
    if (val === "user") {
      $scope.User.password = pass;
    } else {
      $scope.Profile.password = pass;
    }
  };

  $scope.NewUser = function() {
    if ($scope.type !== "0") {
      $scope.operate();
      $scope.User.flag = "X";
      $http.get("/api/otp?email=" + $scope.User.email)
        .then(
          function(response) {
            var otp = prompt("Please enter OTP sent to the entered email");
            if (otp !== null && otp !== "") {
              if (otp == response.data.message) {
                $http.post("/api/user", $scope.User).then(
                  function(response) {
                    alert(response.data.message);
                    $location.path("/dashboard/" + $scope.sessionid);
                  },
                  function(response) {
                    alert(response.data);
                  }
                );
              } else {
                $scope.deoperate("Save");
                alert("Incorrect OTP , please enter correct OTP");
              }
            } else {
              $scope.deoperate("Save");
              alert("OTP is required");
            }
          },
          function(response) {
            $scope.deoperate("Save");
            alert(response.data);
          }
        );
    } else {
      alert("You are not an authorized user");
    }
  };

  $scope.SaveProfile = function() {
    $scope.operate();
    $scope.Profile.flag = "Y";
    $scope.Profile.password =
    $scope.Profile.password === undefined ? "" : $scope.Profile.password;
    $http.post("/api/user", $scope.Profile).then(
      function(response) {
        alert(response.data.message);
        localStorage.clear();
        $location.path("/");
      },
      function(response) {
        $scope.deoperate("Save Profile");
        alert(response.data);
      }
    );
  };

  $scope.ShowOverlay = function() {
    document.querySelector(".overlay").classList.remove("notvisible");
    document.querySelector(".overlay").classList.add("visible");
  };

  $scope.HideOverlay = function() {
    document.querySelector(".overlay").classList.remove("visible");
    document.querySelector(".overlay").classList.add("notvisible");
  };

  $scope.operate = function(text = "Saving...") {
    document.querySelector("#btn-operate").setAttribute("disabled", "disabled");
    document.querySelector("#btn-operate").innerText = text;
  };

  $scope.deoperate = function(text) {
    document.querySelector("#btn-operate").removeAttribute("disabled");
    document.querySelector("#btn-operate").innerText = text;
  };

  /**
   ****************** Destinations and Reviews ******************
   */

  $scope.getDestinations = function() {
    $scope.ShowOverlay();
    $http.get("/api/destination?d=all").then(
      function(response) {
        $scope.DestinationModel = response.data.results;
        $http.get("/api/destination").then(
          function(response) {
            $scope.SelectedDestinations = response.data != "" ? response.data.results : [];
            $scope.SelctedModel = angular.copy($scope.SelectedDestinations);
            $scope.HideOverlay();
          },
          function(response) {
            alert(response.data);
            $scope.HideOverlay();
          }
        );
      },
      function(response) {
        alert(response.data);
      }
    );
  };

  $scope.SelectDestination = function() {
    var val = document.querySelector("#destination").value;
    if (val !== "") {
      var flag = false;
      $scope.DestinationModel[val].status = 1;
      if ($scope.SelectedDestinations.length === 0) {
        $scope.SelectedDestinations.push($scope.DestinationModel[val]);
        $scope.SelctedModel = angular.copy($scope.SelectedDestinations);
      } else {
        if ($scope.SelectedDestinations.length < 6) {
          for (let i = 0; i < $scope.SelectedDestinations.length; i++) {
            if ($scope.SelectedDestinations[i].destination === $scope.DestinationModel[val].destination) {
              flag = true;
            }
          }
          if (flag === false) {
            $scope.SelectedDestinations.push($scope.DestinationModel[val]);
            $scope.SelctedModel = angular.copy($scope.SelectedDestinations);
          } else {
            alert(
              $scope.DestinationModel[val].destination + " is already added"
            );
          }
        } else {
          alert("You can add only 6 destinations");
        }
      }
    } else {
      alert("Please select a valid destination");
    }
  };

  $scope.DeleteDestination = function(index) {
    var del = confirm("Are you sure ?");
    if (del == true) {
      $scope.SelctedModel[index].status = 0;
      $scope.SelectedDestinations.splice(index, 1);
    }
  };

  $scope.SaveDestination = function() {
    $scope.operate();
    $http.post("/api/destination", $scope.SelctedModel)
      .then(
        function(response) {
          alert(response.data.message);
          $scope.getDestinations();
          $scope.deoperate("Save");
        },
        function(response) {
          $scope.deoperate("Save");
          alert(response.data);
        }
      );
  };

  $scope.getReviews = function() {
    $scope.ShowOverlay();
    $http.get("/api/reviews").then(
      function(response) {
        if (response.data === "") {
          $scope.ReviewModel = {
            results: [
              {
                customer_name: "",
                customer_designation: "",
                customer_rating: 1,
                customer_review: "",
                customer_image: "",
                active_block: "",
                active: "",
                block: "'block'",
                flag: false
              }
            ]
          };
        } else {
          let data = response.data.results;
          for (let index = 0; index < data.length; index++) {
            data[index].flag = true;
            data[index].block = index === 0 ? "'block'" : "none";
            data[index].customer_rating = parseInt(data[index].customer_rating);
          }
          $scope.ReviewModel = response.data;
          $scope.HideOverlay();
        }
      },
      function(response) {
        $scope.HideOverlay();
        alert(response.data);
      }
    );
  };

  $scope.AddReview = function() {
    $scope.ReviewModel.results.push({
      customer_name: "",
      customer_desig: "",
      customer_rating: 1,
      customer_review: "",
      customer_image: "",
      active_block: "active-block",
      active: "active",
      block: "'block'",
      flag: false
    });
    $(".accordion-box").find(".accordion .acc-btn").removeClass("active");
    $(".accordion-box").children(".accordion").removeClass("active-block");
    $(".accordion-box").find(".accordion").children(".acc-content").slideUp(300);
    for (let index = 0; index < $scope.ReviewModel.results.length - 1; index++) {
      $scope.ReviewModel.results[index].block = "'none'";
    }
  };

  $scope.DeleteReview = function(index) {
    var del = confirm("Are you sure ?");
    if (del == true) {
      $scope.ReviewModel.results.splice(index, 1);
    }
  };

  $scope.Rating = function(index, val) {
    document.getElementById("rating-value" + index).innerHTML = val;
  };

  $scope.UploadCustomerImg = function(files, index) {
    fd.append("file[]", files[0]);
    var reader = new FileReader();
    reader.onload = function() {
      $scope.ReviewModel.results[index].customer_image = files[0].name;
      document.querySelector("#image" + index).src = reader.result;
    };
    reader.readAsDataURL(files[0]);
  };

  $scope.SaveReviews = function() {
    var flag = 0;
    var reviews = $scope.ReviewModel.results;
    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i].customer_image === "") {
        flag++;
      }
    }
    if (flag === 0) {
      $scope.operate();
      $http.post("/api/reviews", $scope.ReviewModel.results).then(
          function(response) {
            $http.post("/api/upload", fd, {
                transformRequest: angular.identity,
                headers: {
                  "Content-Type": undefined,
                  "Process-Data": false
                }
              }).then(
                function() {
                  alert(response.data.message);
                  $scope.getReviews();
                  $scope.deoperate("Save");
                },
                function(response) {
                  alert(response.data);
                }
              );
          },
          function(response) {
            $scope.deoperate("Save");
            alert(response.data);
          }
        );
    } else {
      alert("Customer Image is required");
    }
  };

  /**
   ****************** Send Email ******************
   */

  $scope.SendEmail = function() {
    $scope.operate("Sending...");
    $http.post("/api/subscribe?send=X", $scope.Email)
      .then(
        function(response) {
          $scope.deoperate("Send");
          $scope.Email = {};
          $scope.email.$setUntouched();
          CKEDITOR.instances.body.setData("");
          alert(response.data.message);
        },
        function(response) {
          $scope.deoperate("Send");
          alert(response.data.message);
        }
      );
  };
});
