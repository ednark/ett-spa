import { EttDay } from './modules/EttDay.class.js';
import { LocalStorage } from './modules/Storage.class.js';

document.addEventListener('DOMContentLoaded', function() {

    const storage = new LocalStorage();
    const today = new Date().toLocaleDateString('en-CA');
    const ettDay = new EttDay(today,storage);
    var ettDayData = storage.get(today)
    if (ettDayData) {
        ettDay.data = ettDayData
        ettDay.data.date = today
    }
    ettDay.render()
    console.log(ettDayData)
    /// each calendar day data-date is a timestamp + three ectra digits on the end
    /// if we ignore the extra digits, we can use the date to match a key in local storage
    /// and add in some logic to show which days have saved data and which don't
    /// we will need the Storage Objects to return a full list of keys without any other data
    /// so we can pass it into the Cal renderer somehow
})
