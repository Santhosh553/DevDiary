# DevDiary
DevDiary is a simple, terminal-based version control system inspired by GitHub. It provides essential functionalities to manage and track changes in your projects. 

## Features

- **init:** Initialize a new DevDiary repository.
- **add files:** Add files to be tracked by DevDiary.
- **commit <message>:** Save snapshots of your project with a descriptive message.
- **log:** View the commit history of your repository.
- **show <commit>:** Display detailed information about a specific commit.


## Installation

To install DevDiary, follow these steps:

1. Clone the repository:
    ```sh
    git clone <repository-url>
    ```

2. Initialize the project:
    ```sh
    npm init -y
    ```

## Usage

After installation, you can start using DevDiary with the following commands:

### Initialize a Repository

Initialize a new DevDiary repository in your project directory using the bash terminal:

```sh
./DevDiary.mjs init
```

## Add Files

Add files to be tracked by DevDiary using the bash terminal:

```sh
./DevDiary.mjs add <sample.txt>
```

### Commit Changes

Commit changes with a descriptive message using the bash terminal:

```sh
./DevDiary.mjs commit "<message>"
```

### View Commit History

View the commit history of your repository using the bash terminal:

```sh
./DevDiary.mjs log
```

### Show Commit Details

Display detailed information about a specific commit using the bash terminal:

```sh
./DevDiary.mjs show "<Hashed Commit Object ID>"
```
