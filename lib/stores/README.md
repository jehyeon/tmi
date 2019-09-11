### Stores

## 1. Capsule store
### methods
#### 1-1. getCapsules
Input
none

Output
```
{
  capsule1: {
    path, targets
  },
  capsule2: {
    path, targets
  }
}
```

#### 1-2. getCapsule (capsuleName)
Input
| Name | Type | Mandatory | Description |
| ---- | ---- | :-------: | ----------- |
| capsuleName | string | O | |

Output
```
{
  path: 'C:\Users\jehyeon\Documents\...',
  targets: {
    'bixby-mobile': {
      exist: true
    }
    'bixby-watch': {
      exist: false
    }
  }
}
```

#### 1-3. addCapsule (capsuleName, capsulePath, targetsOfCapsule)
Input
| Name | Type | Mandatory | Description |
| ---- | ---- | :-------: | ----------- |
| capsuleName | string | O | |
| capsulePath | string | O | File absolute path, `capsule.bxb` must be in capsulePath |
| targetsOfCapsule | Object | O | |


Output
```
Same as 1-1
```

#### 1-4. deleteCapsule (capsuleName)
Input
| Name | Type | Mandatory | Description |
| ---- | ---- | :-------: | ----------- |
| capsuleName | string | O | |

Output
```
Same as 1-1
```

2. Training store
to be update

