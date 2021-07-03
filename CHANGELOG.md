## 1.2.2

Submitted for approval

* __BUG__: Fixed imperial rendering of elevation gained.

## 1.2.1

Unpublished

* __BUG__: Fixed tracking of min/max long to be min/max of mid min/max when it gets cycled through rather than just the min/max of the mid avg.

## 1.2.0

Unpublished

* Added percentage chance of precipitation to main view weather indicators as a blue bar to the left of the icon that gets taller as the chance goes up.
* Added min/max temperature indicators to the main view weather indicators as red and light blue bars to the right of the icon. Both peak at 10 degrees from the listed temperature at their full height. The light blue bar indicates how much colder it will be for the period, and the red bar indicates how much warmer it will be for the period.
* Added an active zone minutes breakdown on the main view as a bar divided into yellow, orange, and red representing each zone and its percentage of the total.
* Added an active zone minutes breakdown to the stats view inside the total wheel and with a list of the minutes for each to the right.
* Added support for starting, pausing, and stopping exercise:
  * The stats view now has a button at the bottom right to open the exercise view.
  * While ongoing, exercise stats replace the next two days weather section in the main view, and double tapping it switches into the exercise view.
* Exercise view:
  * When not currently exercising;
    * displays an icon representing an exercise and left and right arrow buttons to change the target exercise.
    * The buttons at the bottom cancel (left) to go back to the stats view or play (right) to start the exercise.
  * When an exercise is active:
    * displays the exercise icon at the top
    * to the left of the icon are two weather forecasts for the next six hours in three hour increments starting from the left
    * to the right of the icon is a button that will mark a lap
    * in the band below the icon are the elapsed time of the exercise, the current time, and the battery remaining
    * in the cluster to the left, below the band are elevation gained in m or ft and steps taken
    * in the cluster to the right, below the band are the distance travelled and calories burned
    * the top dial indicates the current pace for a mile with a longer bar indicating a slower time
      * inside the top dial are the current pace and the average pace, on top and bottom, respectively
    * the left dial indicates the current speed
      * the number in the center is current speed
      * the number on the left is average speed
      * the number on the right is max speed
    * the right dial indicates the current heart rate
      * the number in the center is current heart rate
      * the number on the left is average hear rate
      * the number on the right is max heart rate
* Added min/max tracking for mid and long heart rate, indicated by a vertical line over the corresponding point. The mid min/max is gathered from all points when the short rate graph cycles. The long min/max is gathered from all of the min/max points of the mid min/max points when the mid rate graph cycles.
* Added min/max listings to the heart rate view with the max at the top left of the graph and the min at the bottom center.
* Added two timers to the time view, which will trigger a vibration when they elapse and switch to the time view while indicating which timer elapsed.
  * The timer set view is opened with a tap on the timer time slot.
  * Tapping the +/- buttons will add or subtract from the time in their column. Tapping the time will add one to the part that is tapped.
* Switched to the System-Bold font for most text so that the monospace hack can be used.
* Added current stopwatch and timer indicators that appear as triangles on the main view time ':', with the top indicating a running stopwatch and the bottom indicating a running timer.

## 1.1.0

2021-06-29

* Switched weather condition from text to an icon.
* Switched stat indicators to icons.
* Added feels like temperature and percentage chance of precipitation to weather view.
* Made a few consistency adjustments to backgrounds.

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
