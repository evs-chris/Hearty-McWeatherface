## 1.0.0

2021-06-28

Initial port of my Ionic watch face that worked in much the same way over to SDK 5 and the Versa 3 era devices.

Features include:

### Main view

* Big 'ole time right in the middle.
* Not so big date right under it.
* Day of week indicator at the bottom of the main view.
* Heart rate graph on the bottom half main view, split into three sections that represent the last minute and forty seconds, 30 minutes, and 10 hours starting from the right.
* Weather city at the top of the main view.
* Current weather in 3 hour increments in the top left pane. The top left weather is now and, moving clockwise, the other two are three hours out. Weather is gathered from the lovely [OpenWeatherMap](https://openweathermap.org/).
* Next two days of weather in the top center pane.
* Current stats in the top right pane, with the progress bar behind indicating completion of the corresponding goal. From top to bottom:
  * Battery percentage
  * Elevation gained in floors
  * Step count
  * Distance moved
  * Calories burned
  * Total active zone minutes
* Each area of the view can be double tapped to get more details. The areas:
  * Time
  * Stats
  * Heart rate long (bottom left)
  * Heart rate mid (bottom center)
  * Heart rate short (bottom right)
  * Weather

### Weather view

* This view shows detailed forecast for the next three days.
* The city (specified or found by location) is listed at the top.
* To the right of the city is the timestamp that the data was retrieved.
* The fields in the table taking up most of the view are (from left to right):
  * day and hour for the entry
  * condition
  * temperature
  * humidity
  * wind direction and speed
  * percentage of cloud cover
* Double tapping anywhere goes back to the main view.

### Time view

* This view features two stopwatches that can be started and paused by tapping them.
* The reset buttons on the right will reset a corresponding paused stopwatch to zero.
* Stopwatches are managed by a timestamp and, if paused, an elapsed time. These are stored in a file on unload, so stopwatches persist between reloads.
* Double tapping anywhere that isn't used to control the stopwatches will go back to the main view. I usually aim for the time at the top.

### Stats view

* This view features your current stats inside rings that indicate your current completion. I like to think of it as my own personal sad olypmics.
The stats are (from left to right, top to bottom):
  * Steps
  * Elevation gain in floors
  * Distance travelled
  * Calories burned
  * Total active zone minutes
* Double tapping anywhere goes back to the main view.

### Heart rate view

* There are three seperate sets of data that can be loaded here, and which one depends on which section you tapped on the main view.
* The time intervals are labelled at the top of the graph.
* Each point is labelled with the number it represents.
