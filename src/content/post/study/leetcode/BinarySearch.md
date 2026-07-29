---
title: "二分查找"
publishDate: "2026-07-29"
updatedDate: "2026-07-29"
description: "讲解二分查找的原理与通性，题目包括704.二分查找、35.搜索插入位置、34.在排序数组中查找元素的第一个和最后一个位置、69.x的平方根、367.有效的完全平方数。"
tags: ["算法", "Leetcode", "数组"]
seriesId: leetcode
orderInSeries: 1
---

## 要求

必须为**有序数组**

## 区间

二分查找的边界定为`left`和`right`  
每一次有效区间是$[left, right]$，左闭右闭区间，`left`和`right`都是有效的索引  
因此，循环条件是`left <= right`  
更新时是`left = mid + 1`和`right = mid - 1`

由此可以解答LeetCode 704.二分查找

> 给定一个 n 个元素有序的（升序）整型数组 nums 和一个目标值 target  ，写一个函数搜索 nums 中的 target，如果 target 存在返回下标，否则返回 -1。

```java

public class Solution {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right){
            int middle = (left + right) / 2;
            if (target < nums[middle]){
                // 位于左侧
                right = middle - 1;
            }else if (nums[middle] < target){
                // 位于右侧
                left = middle + 1;
            } else{
                // 命中
                return middle;
            }
        }
        return -1;
    }
}
```

## 循环不变量

循环不变量是指每次循环开始时都为真的条件  
考虑对应`target`在数组中有多个的情况，如果要查出数组中所有的`target`，则遇到`target`时不能直接返回  
尝试查出数组的左右边界，下面的代码是查出数组的左边界

```java
private static int findFirstBound(int[] nums, int target){
        int left = 0;
        int right = nums.length - 1;
        while (left <= right){
            int middle = (left + right) / 2;
            if (target <= nums[middle]){
                right = middle - 1;
            }else {
                left = middle + 1;
            }
        }
        if (left == nums.length || nums[left] != target) {
            return -1;
        }
        return left;
    }
```

在上述代码中，循环不变量是

- left 左边的所有元素（即下标 $[0, left)$），都 小于 `target`
- right 右边的所有元素（即下标 $(right, 数组长度-1]$），都 大于等于 `target`

当进入循环时，注意

- nums[middle] >= target
  - middle及右边的所有元素都 $\geq$ target
  - right = middle - 1之后循环不变量满足
- nums[middle] < target
  - middle及左边的所有元素都 $\lt$ target
  - left = middle + 1之后循环不变量满足

退出循环时

- 由于一次循环left和right只能步进一次
- 故最后一定left == right + 1
- left指向第一个大于等于target的元素（或者为数组长度，表示所有元素都比target小）
- right指向最后一个小于target的元素

考虑另一种情况

```java
private static int findLastBound(int[] nums, int target){
        int left = 0;
        int right = nums.length - 1;
        // left 左边的所有元素（即下标 [0, left)），都 小于等于 target
        // right 右边的所有元素（即下标 (right, 数组长度-1]），都 大于 target
        while (left <= right){
            int middle = (left + right) / 2;
            if (target < nums[middle]){  // 注意这里是<=
                // nums[middle] > target
                // middle及右边的所有元素都>target
                // right = middle - 1之后满足条件
                right = middle - 1;
            }else {
                // nums[middle] <= target
                // middle及左边的所有元素都<=target
                // left = middle + 1之后满足条件
                left = middle + 1;
            }
        }
        // 由于一次循环left和right只能步进一次
        // 故最后一定left == right + 1
        // right 指向最后一个小于等于target的元素（或为-1，表示元素都>target）
        // left 指向第一个>target的元素
        if (right == -1 || nums[right] != target){
            return -1;
        }
        return right;
    }
```

由此可以解答  
LeetCode 34.在排序数组中查找元素的第一个和最后一个位置
> 给你一个按照非递减顺序排列的整数数组 nums，和一个目标值 target。请你找出给定目标值在数组中的开始位置和结束位置。
> 如果数组中不存在目标值 target，返回 [-1, -1]。

LeetCode 35.搜索插入位置
> 给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

对于平方根问题原理一致，将数组视为$[0, 1 ^2, 2^2, ..., x^2]$，`target`为`x`即可

LeetCode 69.x的平方根

>给你一个非负整数 x ，计算并返回 x 的 算术平方根 。
> 由于返回类型是整数，结果只保留 整数部分 ，小数部分将被 舍去 。

LeetCode 367.有效的完全平方数

> 给你一个正整数 num 。如果 num 是一个完全平方数，则返回 true ，否则返回 false
