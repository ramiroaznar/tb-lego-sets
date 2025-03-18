# Lego Sets Analytics Dashboard

## Overview
This project provides APIs to query and analyze LEGO sets data, including information about sets, themes, and their statistics. It allows filtering and aggregating data by themes, subthemes, and years.

## Tinybird Project
The Tinybird project is structured to manage and analyze LEGO sets data efficiently. It includes various components such as datasources, pipes, endpoints, and materializations to handle data ingestion, transformation, and querying.

### Project Structure
- **connections**: Contains connection configurations (e.g., Kafka).
- **copies**: Contains copy pipes for exporting data.
- **datasources**: Contains datasource definitions for storing raw and processed data.
- **endpoints**: Contains pipe files that define API endpoints for querying data.
- **fixtures**: Contains fixture files for testing.
- **materializations**: Contains materialized pipes for aggregating data at ingestion.
- **pipes**: Contains pipe files for data transformation and querying.
- **tests**: Contains test files for validating pipes and endpoints.

### Data

You could download the data from [Rebrickable](https://rebrickable.com/downloads/) and append it to your sets and themes data sources.

## App Overview
The LEGO Analytics Dashboard is a web application that provides a user-friendly interface to explore and analyze LEGO sets data. It includes features such as filtering by themes and subthemes, viewing statistics, and visualizing data through charts.

### Features
- **Filters Panel**: Allows users to filter LEGO sets by theme, subtheme, and year range.
- **Stats Cards**: Displays key statistics such as total sets, total parts, and average parts per set.
- **Charts**: Visualizes data such as the number of sets and average parts per year.
- **Sets Table**: Lists LEGO sets with details such as name, year, theme, subtheme, and parts.

### Technologies Used
- **Frontend**: HTML, CSS, JavaScript (Charts.js)
- **Backend**: Tinybird Forward

### How to build the data project into Tinybird

1. Clone the repository.
2. Install, login and start developing your Tinybird locally following [this guide](https://www.tinybird.co/docs/forward).

```
curl https://tinybird.co | sh
tb login
tb local start
tb dev
```

3. Deploy the project to Tinybird, first locally and if everything is fine, to the cloud.

```
tb deploy
tb --cloud deploy
```

### How to Run the app
1. Clone the repository.
2. Install dependencies.
3. Run the local development server.
4. Open the app in your browser.

## TODO

- [ ] Refactor app with React or other framework to manage better the state and components
- [ ] Get metadata (i.e. prices) updates from brickset.com
- [ ] Configure CI/CD
- [ ] Configure deployment to github pages

## License
This project is licensed under the MIT License.

