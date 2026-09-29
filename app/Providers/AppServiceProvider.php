<?php

namespace App\Providers;

use App\Models\Customer;
use App\Models\Laptop;
use App\Models\Rental;
use App\Models\Service;
use App\Models\ServicePart;
use App\Models\Sparepart;
use App\Models\SparepartSale;
use App\Policies\CustomerPolicy;
use App\Policies\LaptopPolicy;
use App\Policies\RentalPolicy;
use App\Policies\ServicePolicy;
use App\Policies\SparepartPolicy;
use App\Policies\SparepartSalePolicy;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureMorphMap();
        $this->configurePolicies();
    }

    /**
     * Registrasi eksplisit Policy — auto-discover Laravel 11+ juga bekerja,
     * tapi mendaftarkan di sini membuat mapping visible dan tahan rename.
     */
    protected function configurePolicies(): void
    {
        Gate::policy(Sparepart::class, SparepartPolicy::class);
        Gate::policy(SparepartSale::class, SparepartSalePolicy::class);
        Gate::policy(Rental::class, RentalPolicy::class);
        Gate::policy(Service::class, ServicePolicy::class);
        Gate::policy(Laptop::class, LaptopPolicy::class);
        Gate::policy(Customer::class, CustomerPolicy::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Kunci morph map ke alias pendek supaya `related_type` di DB stabil
     * meskipun class Model direname di masa depan. `enforceMorphMap` juga
     * mencegah kolom terisi FQCN (`App\Models\Service`) yang menyebabkan
     * data drift dengan alias.
     */
    protected function configureMorphMap(): void
    {
        Relation::enforceMorphMap([
            'service' => Service::class,
            'laptop' => Laptop::class,
            'service_part' => ServicePart::class,
            'rental' => Rental::class,
            'sparepart' => Sparepart::class,
            'sparepart_sale' => SparepartSale::class,
        ]);
    }
}
