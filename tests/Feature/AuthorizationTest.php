<?php

use App\Models\User;

test('customer role is blocked from admin dashboard', function () {
    $customer = User::factory()->customer()->create();

    $this->actingAs($customer)->get(route('dashboard'))->assertForbidden();
});

test('customer role is blocked from laptops index', function () {
    $customer = User::factory()->customer()->create();

    $this->actingAs($customer)->get(route('laptops.index'))->assertForbidden();
});

test('staff role can access dashboard and services', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get(route('dashboard'))->assertOk();
    $this->actingAs($staff)->get(route('services.index'))->assertOk();
});

test('staff role is blocked from admin-only laptops', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get(route('laptops.index'))->assertForbidden();
});

test('staff role is blocked from customers management', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get(route('customers.index'))->assertForbidden();
});

test('staff role is blocked from financial transactions', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get(route('financial-transactions.index'))->assertForbidden();
});

test('staff role is blocked from master data', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get(route('master-data.brands.index'))->assertForbidden();
});

test('admin role can access everything', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('dashboard'))->assertOk();
    $this->actingAs($admin)->get(route('laptops.index'))->assertOk();
    $this->actingAs($admin)->get(route('customers.index'))->assertOk();
    $this->actingAs($admin)->get(route('services.index'))->assertOk();
    $this->actingAs($admin)->get(route('financial-transactions.index'))->assertOk();
    $this->actingAs($admin)->get(route('master-data.brands.index'))->assertOk();
});
