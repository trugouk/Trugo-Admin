"use strict";

var app = angular.module("trugo", ["ngRoute"]);

app.directive("ckEditor", function() {
  return {
    require: "ngModel",
    link: function(scope, elm, attr, ngModel) {
      var ck = CKEDITOR.replace(elm[0]);
      ck.on("pasteState", function() {
        scope.$apply(function() {
          ngModel.$setViewValue(ck.getData());
        });
      });
    }
  };
});

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when("/", {
      title: "Trugo - Dashboard Login",
      templateUrl: "/admin/templates/login.html",
      controller: "Root"
    })
    .when("/dashboard/:session", {
      title: "Trugo - Dashboard",
      templateUrl: "/admin/templates/dashboard.html",
      controller: "Root"
    })
    .when("/new/:session", {
      title: "Trugo - New Tour Package",
      templateUrl: "/admin/templates/tour.html",
      controller: "Root"
    })
    .when("/edit/:session", {
      title: "Trugo - Edit Tour Package",
      templateUrl: "/admin/templates/edit.html",
      controller: "Root"
    })
    .when("/profile/:session", {
      title: "Trugo - User Profile",
      templateUrl: "/admin/templates/profile.html",
      controller: "Root"
    })
    .when("/user/:session", {
      title: "Trugo - New User",
      templateUrl: "/admin/templates/user.html",
      controller: "Root"
    })
    .when("/destination/:session", {
      title: "Trugo - Destinations",
      templateUrl: "/admin/templates/destination.html",
      controller: "Root"
    })
    .when("/reviews/:session", {
      title: "Trugo - User Reviews",
      templateUrl: "/admin/templates/reviews.html",
      controller: "Root"
    })
    .when("/email/:session", {
      title: "Trugo - Email",
      templateUrl: "/admin/templates/email.html",
      controller: "Root"
    })
    .otherwise({
      templateUrl: "/admin/templates/login.html"
    });
    $locationProvider.html5Mode(true);
});

app.run([
  "$rootScope",
  "$location",
  function($rootScope, $location) {
    $rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
      if (localStorage.getItem("session")) {
        let session = JSON.parse(localStorage.getItem("session"));
        if (current.pathParams.session !== session.sessionid) {
          $location.path("/");
          $rootScope.title = "Trugo - Dashboard Login";
        } else {
          $rootScope.title = current.$$route.title;
        }
      } else {
        $location.path("/");
        $rootScope.title = "Trugo - Dashboard Login";
      }
    });
  }
]);
